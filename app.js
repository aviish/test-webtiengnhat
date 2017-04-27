let express = require('express');
let expressValidator = require('express-validator');
let session = require('express-session');
let flash = require('express-flash');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let dotenv = require('dotenv');
let moment = require('moment');
let passport = require('passport');
let methodOverride = require('method-override');
let nunjucks = require('nunjucks');
let dateFilter = require('nunjucks-date-filter');

moment.locale(); //vi
// Passport OAuth strategies
require(path.join(__dirname, './config/passport'));

var app = express();

// "Powered By" Middleware:
app.use(function (req, res, next) {
  res.header("X-powered-by", process.env.APP_NAME)
  next()
});

// Load environment variables from .env file
dotenv.load();


// View engine setup for Nunjucks
var env = nunjucks.configure(app.get('views'), {
    autoescape: true,
    express:    app
});

// Add filter(s):
dateFilter.setDefaultFormat('MMM Do YYYY');
env.addFilter('date', dateFilter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'njk');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(expressValidator());
// Session
app.use(session({
  name: process.env.APP_NAME,
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use( function( req, res, next ) {
    res.cookie('XSRF-TOKEN', res.locals._csrf );
    next();
});

// Use Flash messages
app.use(flash());

// Setup Passport Auth
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.user = req.user ? req.user.toJSON() : null;
  next();
});


/**
 * Routes.
 */
require(path.join(__dirname,  './config/routes'))(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
