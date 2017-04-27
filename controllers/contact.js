var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

/**
 * GET /contact
 */
exports.contactGet = function(req, res) {
  res.render('contact', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 */
exports.contactPost = function(req, res) {
  var mailOptions = {
    from: req.body.name + ' ' + '<'+ req.body.email + '>',
    to: process.env.APP_EMAIL_ADDRESS,
    subject: 'Contact Form',
    text:  ' Email: ' + req.body.email + ' Content : ' +  req.body.message
  };

  transporter.sendMail(mailOptions, function(err) {
    req.flash('success', { msg: 'Thank you! Your message has been submitted.' });
    res.redirect('/contact');
  });
};
