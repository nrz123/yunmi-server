var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
require('express-async-errors')
var usersRouter = require('./routes/users');
var cloudRouter = require('./routes/cloud');
var resourceRouter = require('./routes/resource');
var app = express();
// view engine setup
app.set('views', global.appPath + '/views');
app.set('view engine', 'ejs');
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(global.appPath + '/build'));
app.use(express.static(global.appConfig.dest))
app.use(session({
  secret: 'spider-server',   // secret属性的值可以为任意字符串
  resave: false, //固定写法
  saveUninitialized: true  // 固定写法
}))
require('express-ws')(app)
app.use((req, res, next) => {
  if (global.appConfig.password && !req.session.isLogin && req.body.password != global.appConfig.password && !url.startsWith('/resource')) {
    return res.json('error')
  }
  req.session.isLogin = true
  next()
})
app.use('/users', usersRouter);
app.use('/cloud', cloudRouter);
app.use('/resource', resourceRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
