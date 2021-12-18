var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var someFn = require('./model/user');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var addressRouter = require('./routes/address');
var friendRouter = require('./routes/friend');
var calculateDistanceRouter = require('./routes/calculateDistance');

var app = express();
var cors = require('cors')

app.use(cors()) // Use this after the variable declarationconsole.log(result.data);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/address', addressRouter);
app.use('/calculateDistance', calculateDistanceRouter)
app.use('/friend', friendRouter);

mongoose.connect(process.env.mongodbConnectionString, { useNewUrlParser: true }).then(() => {console.log("Connected to MongoDB...")}).catch(e => console.log(e));
// someFn();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
