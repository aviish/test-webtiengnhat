var path = require('path');
var async = require('async');
var crypto = require('crypto');
var passport = require('passport');
var User = require(path.join(__dirname, '../models/User'));
var nodemailer = require('nodemailer');
var multer = require('multer');

exports.getAllUsers = function (req, res) {
  User.fetchAll().then(function(users) {
    res.render('usersList', {users: JSON.stringify(users) });
  });
};
exports.getInfoUser = function(req,res){
  User.where({id: req.params.uid}).fetch().then(function(info){
    res.render('account/info', {info: JSON.parse(JSON.stringify(info)) });
  });
};
/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
};

/**
 * GET /login
 */
exports.loginGet = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Log in'
  });
};

/**
 * POST /login
 */
exports.loginPost = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (!user) {
      req.flash('error', info);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (req.body.remember) {
          req.session.cookie.originalMaxAge = 2592000000;
      } else {
          req.session.cookie._expires = false;
      }
      req.logIn(user, function(err) {
        req.flash('success', { msg: 'Success! You are logged in.' });
        res.redirect('/');
      });
    });
  })(req, res, next);
};

/**
 * GET /logout
 */
exports.logout = function(req, res) {
  req.logout();
  req.flash('success', { msg: 'You are logged out.' });
  res.redirect('/');
};

/**
 * GET /signup
 */
exports.signupGet = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Sign up'
  });
};

/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {

  new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }).save()
    .then(function(user) {
        req.logIn(user, function(err) {
          res.redirect('/');
        });
    })
    .catch(function(err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
        return res.redirect('/signup');
      }
    });
};

/**
 * GET /account
 */
exports.accountGet = function(req, res) {
  res.render('account/profile', {
    title: 'My Account'
  });
};

//up avatar
exports.uploadGet = function(req, res){
  res.render('avatar', {
    title: 'Avatar'
  });
} 


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,'./public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

exports.upload = upload; 

exports.uploadPost = function(req, res){
    var user = new User({ id: req.user.id });
    user.save({ picture: "/uploads/" + req.file.filename }, { patch: true });
    console.log(req.file);
    res.redirect('/account');
}


/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {

  var user = new User({ id: req.user.id });
  if ('password' in req.body) {
    user.save({ password: req.body.password }, { patch: true });
  } else {
    user.save({
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
      gender: req.body.gender,
      location: req.body.location,
      website: req.body.website
    }, { patch: true });
  }
  
  user.fetch().then(function(user) {
    if ('password' in req.body) {
      req.flash('success', { msg: 'Your password has been changed.' });
    } else {
      req.flash('updated', { msg: 'Your profile information has been updated.' });
    }
    res.redirect('/account');
  }).catch(function(err) {
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
    }
  });
};

/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
  new User({ id: req.user.id }).destroy().then(function(user) {
    req.logout();
    req.flash('info', { msg: 'Your account has been permanently deleted.' });
    res.redirect('/');
  });
};


/**
 * GET /forgot
 */
exports.forgotGet = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  var errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      new User({ email: req.body.email })
        .fetch()
        .then(function(user) {
          if (!user) {
        req.flash('error', { msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
        return res.redirect('/forgot');
          }
          user.set('passwordResetToken', token);
          user.set('passwordResetExpires', new Date(Date.now() + 3600000)); // expire in 1 hour
          user.save(user.changed, { patch: true }).then(function() {
            done(null, token, user.toJSON());
          });
        });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: process.env.APP_EMAIL_ADDRESS,
        subject: 'Reset your password',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
        res.redirect('/forgot');
      });
    }
  ]);
};

/**
 * GET /reset
 */
exports.resetGet = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  new User({ passwordResetToken: req.params.token })
    .where('passwordResetExpires', '>', new Date())
    .fetch()
    .then(function(user) {
      if (!user) {
        req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {

  async.waterfall([
    function(done) {
      new User({ passwordResetToken: req.params.token })
        .where('passwordResetExpires', '>', new Date())
        .fetch()
        .then(function(user) {
          if (!user) {
          req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
          }
          user.set('password', req.body.password);
          user.set('passwordResetToken', null);
          user.set('passwordResetExpires', null);
          user.save(user.changed, { patch: true }).then(function() {
          req.logIn(user, function(err) {
            done(err, user.toJSON());
          });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD
        }
      });
      var mailOptions = {
        from: process.env.APP_EMAIL_ADDRESS,
        to: user.email,
        subject: 'Your ' + process.env.APP_NAME + ' password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Your password has been changed successfully.' });
        res.redirect('/account');
      });
    }
  ]);
};