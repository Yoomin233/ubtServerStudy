"use strict";

var db    = require('../db/model.js');
var log   = require('./log.js')();
var _     = require('lodash');

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

function _merge(oldObj,newObj){
  let obj=_.cloneDeep(oldObj);
  for (let key in newObj) {
    if (_.isArray(newObj[key])) {
      obj[key]=obj[key].concat(newObj[key]);
    }
    if (_.isObject(newObj[key])) {
      obj[key]=Object.assign({},obj[key],newObj[key]);
    }
  }
  return obj;
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
        log.error(err);
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
            log.error(err);
            return res.sendStatus(500);
          } 
          return res.sendStatus(200);
        });
      }else{ // Update pv
          if (pvDoc.meta.state=="FINISH"||pvDoc.meta.state=="TIMEOUT") {
            return res.sendStatus(400);
          }

          var _dynamic=_merge(pvDoc.dynamic,pvData.dynamic);
          var _business=_merge(pvDoc.business,pvData.business);
          var _meta=pvDoc.meta;

          if (pvData.dynamic.pvState=="FINISH") {
            var d=new Date();
            d.setTime(pvData.dynamic.unloadTime);
            _dynamic.unloadTime=d;
            _meta.state="FINISH";
          }

          db.PVModel.update(q, {
            dynamic:_dynamic,
            business:_business,
            meta:_meta
          }, {safe: true}, function(err, doc){
            if (err) {
              log.error(err);
              return res.sendStatus(500);
            } 
            return res.sendStatus(200);
          }); 
      }
    });
  } catch (e) {
    log.error(e)
    return res.sendStatus(500);
  }
}
