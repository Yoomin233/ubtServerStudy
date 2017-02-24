var express     = require("express"),
    bodyParser  = require('body-parser');
var config = require('./config/index.js');
var db = require('./db/mongodb.js');
var testModel = require('./db/testdata.model.js');
var pvModel = require('./db/pv.model.js');
var errorreport = require('./modules/errorreport.js');
var reportaggregate = require('./modules/report.aggregate.js');

db.init();

var app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit: '10mb', parameterLimit:50 }));

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
});

app.get("/healthcheck", function(req,res){
  res.sendStatus(200);
});

app.get("/error", function(req,res){
  errorreport.increaseErrorSample();
  return res.sendStatus(200);
});

app.get("/report", reportaggregate.aggregate);

app.get("/point", function(req,res){
  testModel.testModel.findOne({}, function (err, doc) {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    } 
    return res.json(doc);
  });
});

app.get("/ubt/pv.gif", function(req, res) {
  try {
    var queryStr=require('url').parse(req.url).query || '';
    if (queryStr == '') {
        return res.sendStatus(400);
    }
    console.log(decodeURIComponent(queryStr));
    var pvData = JSON.parse(decodeURIComponent(queryStr));
    var pv = new pvModel();
    pv.pv=pvData;
    pv.save(function(err) {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      } 
      return res.sendStatus(200);
    });
  } catch (e) {
  	console.log(e)
    return res.sendStatus(500);
  }
});

var port = process.env.NODE_PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});