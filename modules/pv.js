var db    = require('../db/model.js');
var log   = require('./log.js')();

function _pvValidate(pv){
  if (!pv.dynamic || !pv.static) {
    return false;
  }

  if (!pv.dynamic.pvState) {
    return false;
  }

  return true;
}

exports.pvTimeout=function(){
  var endTime=new Date();
  endTime.setDate(endTime.getDate()-1);

  db.PVModel.update({
    "meta.state":{$exists:true,$ne:"FINISH"},
    "static.visitTime":{$exists:true,"$lt":endTime}
  }, {
    "meta.state":"FINISH"
  }, {multi: true}, function(err, doc){
    if (err) {
      log.error(err);
    } 
    log.info(doc);
  });  
}

exports.save = function(req, res) {
  try {
    var queryStr=require('url').parse(req.url).query || '';
    if (queryStr == '') {
        return res.sendStatus(400);
    }
    var pvData = JSON.parse(decodeURIComponent(queryStr));
    if (!_pvValidate(pvData)) {
      return res.sendStatus(400);
    }
    var docId=[pvData.static.pvId,pvData.static.visitTime,pvData.static.deviceId,pvData.static.uid].join('');
    var q={_id:docId};

    db.PVModel.findOne(q, function (err, pvDoc) {
      if (err) {
        console.log(err);
        return res.sendStatus(401);
      }

      if (!pvDoc) { // Insert new doc
        var pv = new db.PVModel(pvData);
        if (pvData.dynamic.pvState=="FINISH") {
          pvData.meta.state="FINISH";
        }else{
          pvData.meta.state="PENDING";
        }
        pv._id=docId;

        pv.save(function(err) {
          if (err) {
            console.log(err);
            return res.sendStatus(500);
          } 
          return res.sendStatus(200);
        });
      }else{ // Update pv
          if (pvDoc.meta.state=="FINISH"||pvDoc.meta.state=="TIMEOUT") {
            return res.sendStatus(400);
          }

          var _dynamic={};
          _dynamic.performanceTiming=Object.assign({},pvDoc.dynamic.performanceTiming,pvData.dynamic.performanceTiming);
          _dynamic.custom=Object.assign({},pvDoc.dynamic.custom,pvData.dynamic.custom);
          _dynamic.unloadTime=pvDoc.dynamic.unloadTime;
          var _clickLog=pvData.dynamic.clickLog||[];
          var _inputInfo=pvData.dynamic.inputInfo||[];
          var _performanceEntries=pvData.dynamic.performanceEntries||[];
          _dynamic.clickLog=pvDoc.dynamic.clickLog.concat(_clickLog);
          _dynamic.inputInfo=pvDoc.dynamic.inputInfo.concat(_inputInfo);
          _dynamic.performanceEntries=pvDoc.dynamic.inputInfo.concat(_performanceEntries);

          var _meta=pvDoc.meta;

          if (pvData.dynamic.pvState=="FINISH") {
            var d=new Date();
            d.setTime(pvData.dynamic.unloadTime);
            _dynamic.unloadTime=d;
            _meta.state="FINISH";
          }

          db.PVModel.update(q, {
            dynamic:_dynamic,
            meta:_meta
          }, {safe: true}, function(err, doc){
            if (err) {
              console.log(err);
              return res.sendStatus(500);
            } 
            return res.sendStatus(200);
          }); 
      }
    });
  } catch (e) {
    console.log(e)
    return res.sendStatus(500);
  }
}
