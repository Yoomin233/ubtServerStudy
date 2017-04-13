var db = require('../db/model.js');

/*
	PV,UV
*/
function taskPVUnique(p,q,uniqueField){
	var o = {}; 
	o.scope={p:p};
	o.map = function() { 
		var d = new Date(this.static.visitTime);

		var k=d.getFullYear();
		var m=d.getMonth()+1;
		if (p=="week") {
			k=k+'-'+m+'-'+d.getDate();
		}else if (p=="day") {
			k=k+'-'+m+'-'+d.getDate()+'-'+d.getHours();
		}else if (p=="hour") {
			k=k+'-'+m+'-'+d.getDate()+'-'+d.getHours()+'-'+d.getMinutes();
		}

		var _uv="";
		// if (this.static.uId!="") {
		// 	_uv=this.static.uId;
		// }else 
		if (this.static.deviceId!="") {
			_uv=this.static.deviceId;
		}

		emit({time:k},{pv:1,uv:_uv});
	}    
	o.reduce = function(key, values) {
		var uniqueList=[];
    for (var i = values.length - 1; i >= 0; i--) {
    	if (uniqueList.indexOf(values[i].uv) < 0){
    	// var find=0;
    	// for (var j = uniqueList.length - 1; j >= 0; j--) {
    	// 	if (uniqueList[j]==values[i].uv) {
    	// 		find=1;
    	// 		break;
    	// 	}
    	// }
    	// if (find==0) {
    		uniqueList.push(values[i].uv);
    	}
    }

   	var countP = 0;
		values.forEach(function(v) {
		    countP += v['pv'];
		});

    // var countU = 0;
		// uniqueList.forEach(function(v) {
		//     countU += 1;
		// });
		var countU = uniqueList.length;
	  return {pv:countP,uv:countU};
	}
	o.query  = q;  
	return o;
}

/*
	来源
*/
function taskPrePV(p,q){
	var o = {}; 
	o.scope={p:p};
	o.map = function() { 
		var d = new Date(this.static.visitTime);

		var k=d.getFullYear();
		var m=d.getMonth()+1;
		if (p=="week") {
			k=k+'-'+m+'-'+d.getDate();
		}else if (p=="day") {
			k=k+'-'+m+'-'+d.getDate()+'-'+d.getHours();
		}else if (p=="hour") {
			k=k+'-'+m+'-'+d.getDate()+'-'+d.getHours()+'-'+d.getMinutes();
		}

		var _prePvID="";
		if (this.static.prePV.pvId!="") {
			_prePvID=this.static.prePV.pvId;
		}else if (this.static.referrer!="") {
			_prePvID=this.static.referrer.split('?')[0];
		}else if(this.static.channelId!=""){
			_prePvID=this.static.channelId;
		}else{
			_prePvID="DirectAccess";
		}

		emit({time:k,prePV:_prePvID},1);
	}    
	o.reduce = function(key, values) {
	    return Array.sum(values);
	}
	o.query  = q;  
	return o;
}

exports.taskPVUnique=taskPVUnique;
exports.taskPrePV=taskPrePV;

exports.mr = function(req, res){
	var period = req.query.period || 2;
	var taskid = req.query.taskid || 1;
	var field = req.query.field || "uid";
	var queryParams =  req.query.queryParams || "{}";
	queryParams=JSON.parse(queryParams);

	var o = {};

	db.PVModel.count(queryParams, function(err, c) {
        if(err) res.sendStatus(500);
	    	
		if (c>500000) {
			return res.sendStatus(411);
		}else{
			o = taskPVUnique(period,queryParams,field);
			
			db.PVModel.mapReduce(o,function (err, data, stats) { 
				if(err) res.sendStatus(500);
			    return res.json({processtime:stats.processtime,results:data});
			});
		}	
    });
}


