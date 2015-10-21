var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
var compass = require('node-compass');

var routes = require('./routes/index');
var business = require('./routes/business');

var app = express();

// app config
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorzie: true
    })
  ]
}));
// This requires the compass ruby gem in order to compile compass
// $ gem update --system
// $ gem install compass
app.use(compass({
  'project': path.join(__dirname, 'public'),
  'logging': true
}));

// routes
app.use('/', routes);
app.use('/business', business);

// middleware error logger (needs to be called after all routers)
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorzie: true
    })
  ]
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
