"use strict";

var schedule 		= require('node-schedule');
var db 				= require('../db/model.js');
var configAPI 		= require('./config.js');
var UBTAggregate 	= require('./aggregate.js');
var MR 				= require('./report.mapreduce.js');
var Builder 		= require('../scripts/builder.js');
var log             = require('./log.js')();
var threshold       = require('./threshold.js');
var redisClient 	= require('./redis').redisClient;
var async           = require('async');

const _filed_pv_id="static.pvId";
const _filed_appname="static.appName";

function _cb(cb){
	return function _cb(err, doc){
	    if (err) {
	      log.error(err);
	    }
	    log.info(doc);
	    cb();
	}
}

function _cb_agg(_pipeline,aggField,aggValue,period,cb){
	return function(err,result){
	    if (err) {
	    	log.error(err);
	    	cb();
	    	return;
	    }
	    if (result.length>0) {
	    	log.info('[%s]%s', aggValue,JSON.stringify(result));
	    	var q={
	    		reportName:"PV", 
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
			  _cb(cb)
		  	);
	    }else{
	    	cb();
	    }
	}
}

function _cb_mapreduce(_pipeline,aggField,aggValue,period,cb){
	return function (err, data, stats) { 
	    if (err) {
	    	log.error(err);
	    	cb();
	    	return;
	    }
	    log.info("%s:%s",aggValue,JSON.stringify(stats));
	    if (data.length>0) {
	    	var q={
	    		reportName:"mapreduce", 
			    startTime: _pipeline.match.visitTime["$gte"],
			    dEndTime: _pipeline.match.visitTime["$lt"]
			};
			q[aggField]=aggValue;
			q.period=period;
			q.stats=stats;
			db.ReportResultModel.update(
			  q, 
			  {
			    report:data
			  }, 
			  {safe: true, upsert: true},
			  _cb(cb)
		  	);
	    }else{
	    	cb();
	    }
	}
}

function agg(aggField,aggValue,period,cb){
	let _pipeline=Builder.pv(period,aggField,aggValue);
	let aggregation = new UBTAggregate(db.PVModel);
	for(let attr in _pipeline){
	  let val = _pipeline[attr];
	  aggregation[attr](val);
	}
	aggregation.exec(_cb_agg(_pipeline,aggField,aggValue,period,cb));
}

function mr(aggField,aggValue,period,cb){
	let _pipeline=Builder.pv(period,aggField,aggValue);
	var q={};
	q[aggField]=aggValue;
	q["static.visitTime"]=_pipeline.match.visitTime;
	var o = MR.taskPVUnique(period,q,"");
	db.PVModel.mapReduce(o,_cb_mapreduce(_pipeline,aggField,aggValue,period,cb));
}

function pvuv(period){
	var _period=period;
	configAPI._q("all-pvids",function(err,doc){
		if (err) {
		  log.error(err);
		  return;
		}
		let pvids=doc.value;
		let _arr=[];
		for(let i=0;i<pvids.length;i++){
			let _pvid=pvids[i];
			_arr.push(function(callback){
				agg(_filed_pv_id,_pvid,_period,callback);
			});
			_arr.push(function(callback){
				mr(_filed_pv_id,_pvid,_period,callback);
			});
		}
		async.series(_arr)
	});

	configAPI._q("all-apps",function(err,doc){
		if (err) {
		  log.error(err);
		  return;
		}
		let appNames=doc.value;
		let _arr=[];
		for(let i=0;i<appNames.length;i++){
			let appName=appNames[i];
			_arr.push(function(callback){
				agg(_filed_appname,appName,_period,callback);
			});
			_arr.push(function(callback){
				mr(_filed_appname,appName,_period,callback);
			});
		}
		async.series(_arr)
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
	    configAPI._update(_persistenceKey,{value:result},function(err, doc){
		    if (err) {
		      log.error(err);
		    }
		    log.info(doc);
		});
	});		
}

exports.startSchedule=function(){

	schedule.scheduleJob('1 * * * *', function(){
		/* Show Value
		redisClient.getAsync("min-error-limit").then(function(res){
			log.info("error threshold:%s",res);
		});
		*/
		threshold.updateThreshold()
	});	

	schedule.scheduleJob('2 4 * * *', function(){
		log.info("do task [allpvids]");
		_fieldDistinct("pvId","all-pvids");
	});	

	schedule.scheduleJob('4 4 * * *', function(){
		log.info("do task [allAppNames]");
		_fieldDistinct("appName","all-apps");
	});	

	schedule.scheduleJob('1 * * * *', function(){
		log.info("do task [pvuv] hourly");
	  	pvuv("hour");
	});	

	schedule.scheduleJob('30 4 * * *', function(){
		log.info("do task [pvuv] daily");
	  	pvuv("day");
	});	

	schedule.scheduleJob('5 * * *', function(){
		log.info("do task [pvuv] latest 7 days");
	  	pvuv("week");
	});	
}



