"use strict";

var schedule = require('node-schedule');
var db = require('../db/model.js');
var configAPI = require('./config.js');
var UBTAggregate = require('./aggregate.js');

function _aggByScript(script,cb){
  var aggregation = new UBTAggregate(db[script.collection]);
  var _pipeline=script.pipeline;
	for(var attr in _pipeline){
	  var val = _pipeline[attr];
	  aggregation[attr](val);
	}
  aggregation.exec(cb);
}

function pv(){
	configAPI._q("all-pvids",function(err,doc){
		console.log("["+new Date()+"]do task [pv]");

		if (err) {
		  console.log(err);
		  return;
		}
		let pvids=doc.value;
		for(let i=0;i<pvids.length;i++){
			let _pvid=pvids[i];
			//let _pvid="h5-DX-1.0.0-/index.html-#TEST2-UBT - demo-";
			var d=new Date();
			var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
			dStartTime.setHours(dStartTime.getHours()-1);

			var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);

			var _pipeline={
				project:{
		        	"static":1,
		        	"visitTime": "$static.visitTime"
				},
				match:{
					"static.pvId":_pvid,
					"visitTime":{"$gte":dStartTime,"$lt":dEndTime}
				},
				group:{
					_id:{
						minutes: { $minute: "$visitTime" },
						hour: { $hour: "$visitTime" },
			            day: { $dayOfMonth: "$visitTime" }, 
			            month: { $month: "$visitTime" },  
			            year: { $year: "$visitTime" } 
					},
					count: { $sum: 1 }
				},
				sort:{
					_id: -1
				}
			};

			var aggregation = new UBTAggregate(db.PVModel);
			for(var attr in _pipeline){
			  var val = _pipeline[attr];
			  aggregation[attr](val);
			}
			aggregation.exec(function(err,result){
			    if (err) {
			    	console.log(err);
			    	return ;
			    }
			    if (result.length>0) {
					db.ReportResultModel.update(
					  { 
					    pvid: _pvid,
					    startTime: dStartTime,
					    dEndTime: dEndTime
					  }, 
					  {
					    report:result
					  }, 
					  {safe: true, upsert: true},
					  function(_err, doc){
					    if (_err) {
					      console.log(_err);
					    }
					    console.log(doc);
				  	  }
				  	);
			    }
			});
		}	
	})

}

function allpvids(){
	console.log("["+new Date()+"]do task [allpvids]");
	db.PVModel.distinct("static.pvId",{"static.pvId":{"$ne":""}},function(err,pvids){
	    if (err) {
	    	console.log(err);
	    	return;
	    }
	    configAPI._update("all-pvids",{value:pvids},function(err, doc){
			if (err) {
			  console.log(err);
			  return;
			}
			console.log(doc);
	    });
	});	
}

exports.startSchedule=function(){
	schedule.scheduleJob('* 5 * * * *', function(){
	  allpvids();
	});	

	//schedule.scheduleJob('* 1 * * * *', function(){
	  pv();
	//});	
}



