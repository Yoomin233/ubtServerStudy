const express     = require("express");
const bodyParser  = require('body-parser');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');
const router = express.Router();
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var config = require('./config/index.js');
var db = require('./db/mongodb.js');
var model = require('./db/model.js');
var errorreport = require('./modules/errorreport.js');
var reportaggregate = require('./modules/report.aggregate.js');
var configAPI = require('./modules/config.js');
var trace = require('./modules/trace.js');
var pv = require('./modules/pv.js');
var schedule = require('./modules/schedule.js');

db.init();
const app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit: '10mb', parameterLimit:50 }));
app.use(methodOverride());

restify.serve(router, model.PVModel);
restify.serve(router, model.TraceModel);

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

app.get("/healthcheck", function(req,res){
  res.sendStatus(200);
});
app.post("/report", reportaggregate.aggregate);
app.get("/config/q/:configKey", configAPI.q);
app.post("/config/update", configAPI.update);
app.get('/ubt/trace.gif', trace.traceError);
app.get("/ubt/pv.gif", pv.save);

var port = process.env.NODE_PORT || 8080;
app.listen(port, function() {
	console.log("Listening on " + port);
});

schedule.startSchedule();