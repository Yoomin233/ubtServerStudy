var db = require('../db/model.js');
var errorreport = require('./errorreport')

exports.traceLog = function(req, res) {
  if (!req.query.data) {
    return res.send('error data is needed');
  }
  var errorInfo = JSON.parse(req.query.data);
  // report Errors 数加1
  if (errorInfo.level=="ERROR"||errorInfo.level=="FATAL") {
    errorreport.increaseErrorSample();
  }

  // 增加PV error记录
  var docum = new db.TraceModel(errorInfo);
  docum.save((err,doc) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    return res.json(doc);
  });
}
