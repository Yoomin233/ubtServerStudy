"use strict";

var schedule 		= require('node-schedule');
var db 				= require('../db/model.js');
var configAPI 		= require('./config.js');
var UBTAggregate 	= require('./aggregate.js');
var Builder 		= require('../scripts/builder.js');
var log             = require('./log.js')();

function _cb(err, doc){
    if (err) {
      log.error(err);
    }
    log.info(doc);
}

function agg(aggField,aggValue,period){
	let _pipeline=Builder.pv(period,aggField,aggValue);
	let aggregation = new UBTAggregate(db.PVModel);
	for(let attr in _pipeline){
	  let val = _pipeline[attr];
	  aggregation[attr](val);
	}
	aggregation.exec(function(err,result){
	    if (err) {
	    	log.error(err);
	    	return ;
	    }
	    if (result.length>0) {
	    	log.info('[%s]%s', aggValue,JSON.stringify(result));
	    	var q={ 
			    startTime: _pipeline.match.visitTime["$gte"],
			    dEndTime: _pipeline.match.visitTime["$lt"]
			};
			q[aggField]=aggValue;
			q.period=period;
			db.ReportResultModel.update(
			  q, 
			  {
			    report:result
			  }, 
			  {safe: true, upsert: true},
			  _cb
		  	);
	    }else{
	    	//log.warn("Aggregate no result:"+JSON.stringify({field:aggField,value:aggValue,period:period}));
	    }
	});
}

function pv(period){
	var _period=period;
	configAPI._q("all-pvids",function(err,doc){
		if (err) {
		  log.error(err);
		  return;
		}
		let pvids=doc.value;
		for(let i=0;i<pvids.length;i++){
			let _pvid=pvids[i];
			agg("static.pvId",_pvid,_period);
		}	
	});

	configAPI._q("all-apps",function(err,doc){
		if (err) {
		  log.error(err);
		  return;
		}
		let appNames=doc.value;
		for(let i=0;i<appNames.length;i++){
			let appName=appNames[i];
			agg("static.appName",appName,_period);
		}	
	});
}

function _fieldDistinct(field,persistenceKey){
	var _field="static."+field;
	var _persistenceKey=persistenceKey;
	db.PVModel.distinct(_field,{_field:{"$ne":""}},function(err,result){
	    if (err) {
	    	log.error(err);
	    	return;
	    }
	    configAPI._update(_persistenceKey,{value:result},_cb);
	});		
}

exports.startSchedule=function(){

	schedule.scheduleJob('2 4 * * *', function(){
		log.info("do task [allpvids]");
		_fieldDistinct("pvId","all-pvids");
	});	

	schedule.scheduleJob('4 4 * * *', function(){
		log.info("do task [allAppNames]");
		_fieldDistinct("appName","all-apps");
	});	

	schedule.scheduleJob('1 * * * *', function(){
		log.info("do task [pv] hourly");
	  	pv("hour");
	});	

	schedule.scheduleJob('6 4 * * *', function(){
		log.info("do task [pv] daily");
	  	pv("day");
	});	

	schedule.scheduleJob('8 4 * * *', function(){
		log.info("do task [pv] latest 7 days");
	  	pv("week");
	});	
}



