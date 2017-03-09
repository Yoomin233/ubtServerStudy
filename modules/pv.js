var db = require('../db/model.js');

exports.save = function(req, res) {
  try {
    var queryStr=require('url').parse(req.url).query || '';
    if (queryStr == '') {
        return res.sendStatus(400);
    }
    console.log(decodeURIComponent(queryStr));
    var pvData = JSON.parse(decodeURIComponent(queryStr));
    var pv = new db.PVModel(pvData);

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
}
