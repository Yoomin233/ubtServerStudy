"use strict";

var schedule 		= require('node-schedule');
var db 				= require('../db/model.js');
var configAPI 		= require('./config.js');
var UBTAggregate 	= require('./aggregate.js');
var MR 				= require('./report.mapreduce.js');
var Builder 		= require('../scripts/builder.js');
var log             = require('./log.js')();
var threshold       = require('./threshold.js');
var pv       		= require('./pv.js');
var redisClient 	= require('./redis').redisClient;
var async           = require('async');

const _field_pv_id="static.pvId";
const _field_osname="static.userAgent.os.name";
const _field_browsername="static.userAgent.browser.name";
const _field_appname="static.appName";

function _cb(cb){
	return function _cb(err, doc){
	    if (err) {
	      log.error(err);
	    }
	    log.info(doc);
	    cb();
	}
}

function _cb_agg_time(_pipeline,aggField,aggValue,period,reportName,cb){
	return function(err,result){
	    if (err) {
	    	log.error(err);
	    	cb();
	    	return;
	    }
	    if (result.length>0) {
	    	log.info('[%s]%s', aggValue,JSON.stringify(result));
	    	var q={
	    		reportName:reportName, 
			    startTime: _pipeline.match.visitTime["$gte"],
			    endTime: _pipeline.match.visitTime["$lt"]
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

function _cb_agg_id(_pipeline,reportName,appName,cb){
	return function(err,result){
	    if (err) {
	    	log.error(err);
	    	cb();
	    	return;
	    }
	    if (result.length>0) {
	    	log.info('%s',JSON.stringify(result));
	    	var q={
	    		reportName:reportName,
	    		appName:appName
			};
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

function _cb_mapreduce(_pipeline,aggField,aggValue,period,reportName,cb){
	return function (err, data, stats) { 
	    if (err) {
	    	log.error(err);
	    	cb();
	    	return;
	    }
	    if (data.length>0) {
	    	var q={
	    		reportName:reportName, 
			    startTime: _pipeline.match.visitTime["$gte"],
			    endTime: _pipeline.match.visitTime["$lt"]
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

function agg_time(aggField,aggValue,period,cb){
	let _pipeline=Builder.time(period,aggField,aggValue);
	let aggregation = new UBTAggregate(db.PVModel);
	for(let attr in _pipeline){
	  let val = _pipeline[attr];
	  aggregation[attr](val);
	}
	let _reportName="Agg-"+aggField;
	aggregation.exec(_cb_agg_time(_pipeline,aggField,aggValue,period,_reportName,cb));
}

function agg_id(groupIDField,appName,cb){
	let _pipeline=Builder.groupID(groupIDField,appName);
	let aggregation = new UBTAggregate(db.PVModel);
	for(let attr in _pipeline){
	  let val = _pipeline[attr];
	  aggregation[attr](val);
	}
	let _reportName="Agg-"+groupIDField;
	aggregation.exec(_cb_agg_id(_pipeline,_reportName,appName,cb));
}

function mr_pvuv(aggField,aggValue,period,cb){
	let _pipeline=Builder.time(period,aggField,aggValue);
	var q={};
	q[aggField]=aggValue;
	q["static.visitTime"]=_pipeline.match.visitTime;
	var o = MR.taskPVUnique(period,q,"");
	db.PVModel.mapReduce(o,_cb_mapreduce(_pipeline,aggField,aggValue,period,"MR-PVUV",cb));
}

function mr_prepv(aggField,aggValue,period,cb){
	let _pipeline=Builder.time(period,aggField,aggValue);
	var q={};
	q[aggField]=aggValue;
	q["static.visitTime"]=_pipeline.match.visitTime;
	var o = MR.taskPrePV(period,q);
	db.PVModel.mapReduce(o,_cb_mapreduce(_pipeline,aggField,aggValue,period,"MR-PrePV",cb));
}

function statistic(period){
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
				agg_time(_field_pv_id,_pvid,_period,callback);
			});
			_arr.push(function(callback){
				mr_pvuv(_field_pv_id,_pvid,_period,callback);
			});
			_arr.push(function(callback){
				mr_prepv(_field_pv_id,_pvid,_period,callback);
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
				agg_time(_field_appname,appName,_period,callback);
			});
			_arr.push(function(callback){
				agg_id(_field_osname,appName,callback);
			});
			_arr.push(function(callback){
				agg_id(_field_browsername,appName,callback);
			});
			_arr.push(function(callback){
				mr_pvuv(_field_appname,appName,_period,callback);
			});
			_arr.push(function(callback){
				mr_prepv(_field_appname,appName,_period,callback);
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
	/* mapreduce test
	var o = MR.taskPrePV("day",{"static.appName":"UBT-Portal"});
	db.PVModel.mapReduce(o,function (err, data, stats) { 
	    if (err) {
	    	log.error(err);
	    	return;
	    }
	    log.info(data);
	    log.info(stats);
	});
	*/

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
		log.info("do task [statistic] hourly");
	  	statistic("hour");
	});	

	schedule.scheduleJob('5 * * * *', function(){
		log.info("do task [pvTimeout] hourly");
		pv.pvTimeout();
	});	

	schedule.scheduleJob('30 4 * * *', function(){
		log.info("do task [statistic] daily");
	  	statistic("day");
	});	
/*
	schedule.scheduleJob('5 * * *', function(){
		log.info("do task [statistic] latest 7 days");
	  	statistic("week");
	});	
*/
}



