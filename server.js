var compression = require('compression');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || '4000'));
app.use(compression()); 
app.use(express.static(path.join(__dirname, './')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen((process.env.PORT || '4000'), function () {
  console.log('Listening on port %d', server.address().port);
});


app.get('/', function (req, res, next) {
  res.sendFile(path.join(__dirname, './index.html'));
});

// enable "clean" URLs
app.use(express.static(__dirname + '', {
  extensions: ['html']
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// production error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  next(err);
});

module.exports = app;
