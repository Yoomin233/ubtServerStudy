const express     = require("express");
const bodyParser  = require('body-parser');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');
const router = express.Router();
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('./config/index.js');
var db = require('./db/mongodb.js');
var pvModel = require('./db/pv.model.js');
var {ErrorModel} = require('./db/error.model.js')
var errorreport = require('./modules/errorreport.js');
var reportaggregate = require('./modules/report.aggregate.js');
var configAPI = require('./modules/config.js');
var configModel = require('./db/config.model.js');

db.init();

const app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit: '10mb', parameterLimit:50 }));
app.use(methodOverride());

var Customer = new Schema({
  name: { type: String, required: true },
  comment: { type: Schema.Types.Mixed }
})
var CustomerModel = mongoose.model('Customer', Customer)

restify.serve(router, CustomerModel);

app.use(router)

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

// ====== Test purpose API ========
app.get("/errorTest", function(req,res){
  errorreport.increaseErrorSample();
  return res.sendStatus(200);
});
app.get("/push", function(req,res){
  require('./modules/push.js').push("hi hi hi!!!");
  return res.sendStatus(200);
});
// ====== End Test ========

app.get("/healthcheck", function(req,res){
  res.sendStatus(200);
});

app.get("/report", reportaggregate.aggregate);

app.get("/config/q/:configKey", configAPI.q);
app.post("/config/update", configAPI.update);

app.get('/error', (req, res) => {
  if (!req.query.data) {
    // return res.sendStatus(400);
    return res.send('error data is needed');
  }
  var errorInfo = JSON.parse(req.query.data);
  // report Errors 数加1
  errorreport.increaseErrorSample();
  // 增加PV error记录
  var docum = new ErrorModel(errorInfo);
  docum.save((err,doc) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    return res.json(doc);
  });
})

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