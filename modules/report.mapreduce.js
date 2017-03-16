var db = require('../db/model.js');

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
		if (this.static.uid!="") {
			_uv=this.static.uid;
		}else if (this.static.deviceid!="") {
			_uv=this.static.deviceid;
		}

		emit({time:k},{pv:1,uv:_uv});
	}    
	o.reduce = function(key, values) {
		var uniqueList=[];
        for (var i = values.length - 1; i >= 0; i--) {
        	var find=0;
        	for (var j = uniqueList.length - 1; j >= 0; j--) {
        		if (uniqueList[j]==values[i].uv) {
        			find=1;
        			break;
        		}
        	}
        	if (find==0) {
        		uniqueList.push(values[i].uv);
        	}
        }

       	var countP = 0;
		values.forEach(function(v) {
		    countP += v['pv'];
		});

       	var countU = 0;
		uniqueList.forEach(function(v) {
		    countU += 1;
		});
	    return {pv:countP,uv:countU};
	}
	o.query  = q;  
	return o;
}

exports.taskPVUnique=taskPVUnique;
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


