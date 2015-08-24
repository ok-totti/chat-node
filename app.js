/* Copyright 2013 Intelligent Technology Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var busboy = require('connect-busboy');
var multer = require('multer');
var fs = require('fs');
var paginate = require('mongoose-paginate');
require('date-utils');
var dt = new Date();
var formatted = dt.toFormat("YYYYMMDDHH24MISS");
var session = require('express-session');


var login = require('./routes/login');
var chat = require('./routes/chat');
var message = require('./routes/message');
var search = require('./routes/search');
var upload = require('./routes/upload');
var signup = require('./routes/signup');

var mongoose = require('mongoose');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000
  }
}));

var sessionCheck = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};


app.use(methodOverride())
app.use(bodyParser({ uploadDir: path.join(__dirname, 'files'), keepExtensions: true }));
app.use(busboy());

app.post('/upload', function(req, res) {
    console.log(req)
    var fstream;
    var date = formatted
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/public/files/' + date + '-' + req.session.user_id + '-'+ filename);
        file.pipe(fstream);
        res.json(date + '-' + req.session.user_id + '-' + filename)
        //fstream.on('close', function () {
        //  res.render("aaa");
        //});
    });
});


app.use('/', login);
app.use('/signup', signup);
app.post('/login', function(req, res) {
  if(req.body.username && req.body.pass) {
    message.pass(req.body.username, function(user){
      if (user.pass == req.body.pass){
        req.session.user = req.body.username
        req.session.user_id = req.body._id
        res.redirect('/chat');
      } else {
        res.redirect('/')
      }
    });
  }
  else {
    res.redirect("/");
  }
});

app.post('/create', function(req, res) {
  if(req.body.username && req.body.pass) {
    message.user(req,function(code){
      //ユーザー名が被っている時
      if(code == "1"){
        res.redirect("/signup");
      }else{
        res.redirect("/");
      }
    })
  }
  else {
    res.redirect("/signup");
  }
});

app.use('/', sessionCheck);
app.use('/chat', chat);
app.use('/message', message.findAll);
app.use('/search', search);




// / catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// / error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message : err.message,
			error : err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message : err.message,
		error : {}
	});
});

module.exports = app;