var db = require('../db/model.js');

function _pvValidate(pv){
  return true;
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
          console.log("update pv");
          var _dynamic={};
          _dynamic.preformance=Object.assign({},pvDoc.dynamic.performance,pvData.dynamic.performance);
          _dynamic.custom=Object.assign({},pvDoc.dynamic.custom,pvData.dynamic.custom);
          _dynamic.unloadTime=pvDoc.dynamic.unloadTime;
          console.log(pvDoc.dynamic.unloadTime)
          var _clickLog=pvData.dynamic.clickLog||[];
          var _inputInfo=pvData.dynamic.inputInfo||[];
          _dynamic.clickLog=pvDoc.dynamic.clickLog.concat(_clickLog);
          _dynamic.inputInfo=pvDoc.dynamic.inputInfo.concat(_inputInfo);
          _metaState=pvDoc.meta.state;

          if (pvData.dynamic.pvState=="FINISH") {
            var d=new Date();
            d.setTime(pvData.dynamic.unloadTime);
            _dynamic.unloadTime=d;

            _metaState="FINISH";
          }
          console.log(_dynamic);

          db.PVModel.update(q, {
            dynamic:_dynamic
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
