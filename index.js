const express        = require("express");
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const restify        = require('express-restify-mongoose');
const mongoose       = require('mongoose');
const jwt            = require('express-jwt');
var morgan           = require('morgan')
var config           = require('./config/index.js');
var db               = require('./db/mongodb.js');
var model            = require('./db/model.js');
var errorreport      = require('./modules/errorreport.js');
var reportaggregate  = require('./modules/report.aggregate.js');
var configAPI        = require('./modules/config.js');
var trace            = require('./modules/trace.js');
var pv               = require('./modules/pv.js');
var schedule         = require('./modules/schedule.js');
var users            = require('./modules/users.js');
var log              = require('./modules/log.js')();
var secret           = require('./config/secret');

const router= express.Router();
var Schema= mongoose.Schema;
db.init();
const app = express();
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit: '10mb', parameterLimit:50 }));
app.use(morgan('combined'));
app.use(methodOverride());
if (process.env.NODE_ENV=='production') {
  app.use(jwt({secret: secret.secretToken}).unless({path: ['/healthcheck','/ubt/trace.gif','/users/signin','/ubt/pv.gif','/users/register','/config/q/domainlist']}));
}
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
restify.serve(router, model.PVModel);
restify.serve(router, model.TraceModel);
restify.serve(router, model.ReportResultModel);
app.use(router)
app.get("/healthcheck", function(req,res){
  res.sendStatus(200);
});
app.post("/report", reportaggregate.aggregate);
app.get("/config/q/:configKey", configAPI.q);
app.post("/config/update", configAPI.update);
app.get('/ubt/trace.gif', trace.traceLog);
app.get("/ubt/pv.gif", pv.save);
app.post("/users/signin", users.signin);
app.get("/users/logout", users.logout);
app.post("/users/register", users.register);
var port = process.env.NODE_PORT || 8080;
app.listen(port, function() {
	log.info("Listening on " + port);
});
schedule.startSchedule();

//console.log(new Buffer("YWFh", 'base64').toString());