var compression = require('compression');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var pg = require('pg');

app.set('port', '4000');
app.use(compression()); 
app.use(express.static(path.join(__dirname, './')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


var server = app.listen('4000', function () {
  console.log('Listening on port %d', server.address().port);
});

function incrementViewer(investorName) {
  pg.connect(process.env.DATABASE_URL, function (connectionErr, client, done) {
    if (connectionErr) {
      return console.error("error connecting to the database " + connectionErr);
    }
    else {
      client.query("SELECT * FROM viewers where name = $1", [investorName], function (findErr, investorResult) {
        if (findErr) {
         return console.error("error running find investor query " + findErr);
        }
        else if (investorResult.rows.length > 0) {  // investor exists in db so increment by one
          client.query("UPDATE viewers SET views = views + 1 WHERE name = $1", [investorName], function (updateErr, updateResult) {
            done();
            if (updateErr) {
              return console.error("error updating the viewer entry " + updateErr);
            }
          });
        }
        else { //investor is new, create an entry and init their views at one.
          client.query("INSERT INTO viewers VALUES ($1, 1)", [investorName], function (insertErr, insertResult) {
            done();
            if (insertErr) {
              return console.error("error inserting a new viewer entry " + updateErr);
            }
          });
        }
      });
    }
  });
}

function getViewers(callback) {
  pg.connect(process.env.DATABASE_URL, function (connectionErr, client, done) {
    if (connectionErr) {
      callback("error connecting to the database " + connectionerr, null);
    }
    else {
      client.query("SELECT * FROM viewers", function (queryErr, result) {
        done();
        if (queryErr) {
          callback("error running getViewers query " + queryErr, null);
        }
        else {
          callback(false, result.rows);
        }
      });
    }
  });
}

app.get('/:investor', function (req, res, next) {
  // res.sendFile(path.join(__dirname, './index.html'));
  var investor = req.params['investor'];
  if (investor) {
    incrementViewer(investor);
  	res.render('index', {
  	  investor: req.params["investor"]
  	});
  }
  else {
    res.status(500).send("error must specify an id to view");	
  }
});

app.get('/admin/viewerList', function (req, res, next) {
  // res.sendFile(path.join(__dirname, './index.html'));
  getViewers(function (err, viewersJSON) {
    if (err) {
      res.status(500).send(err);
    } 
    else {
      res.status(200).send(JSON.stringify(viewersJSON));  
    }
  });
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
