var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
//CORS - React demo
var cors = require('cors');

var mongoDB =
    "mongodb+srv://affectdrain0b:7e8D9AO3ztWHtiW1@cluster0.zblai.mongodb.net/wise-timetable?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// LOKALNA POVEZAVA - MORA DELAT (ZAKOMENTIRAJ ZGORNJO KODO IN UPORABI ZAKOMENTIRANO)
/*
const mongoDB = 'mongodb://localhost:27017/YourVoice';
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
*/

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/UserRoutes');
var postsRouter = require('./routes/PostRoutes');
var forumsRouter = require('./routes/ForumRoutes');
var commentRouter = require('./routes/CommentRoutes');
var pollRouter = require('./routes/PollRoutes');

var app = express();

app.disable('etag');
/*
// view engine setup
app.set('views', path.join(__dirname, 'views'));
var hbs = require('hbs');
app.set("view engine", "hbs");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");
*/
const oneDay = 1000 * 60 * 60 * 24;
var session = require('express-session');
var MongoStore = require('connect-mongo');
const PollControler = require('./controllers/PollControler');
app.use(
  session({
    name: 'session',
    secret: 'this is a secret key',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    store: MongoStore.create({ mongoUrl: mongoDB }),
  })
);

var allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4100',
  'http://localhost:3000',
];

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/post', postsRouter);
app.use('/forum', forumsRouter);
app.use('/comment', commentRouter);
app.use('/poll', pollRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});

module.exports = app;
