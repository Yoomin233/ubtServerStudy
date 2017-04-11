var db          = require('../db/model.js');
var errorreport = require('./errorreport')
var log         = require('./log.js')();

exports.traceLog = function(req, res) {
  var query=require('url').parse(req.url).query || '';
  if (!query) {
    return res.send('error data is needed');
  }
  var errorInfo = JSON.parse(decodeURIComponent(query));
  // report Errors 数加1
  if (errorInfo.level=="ERROR"||errorInfo.level=="FATAL") {
    errorreport.increaseErrorSample();
  }

  // 增加PV error记录
  var docum = new db.TraceModel(errorInfo);
  docum.save((err,doc) => {
    if (err) {
      log.error(err);
      return res.sendStatus(500);
    }
    return res.json(doc);
  });
}
