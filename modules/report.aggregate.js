var db = require('../db/model.js');

exports.aggregate =function(req,res){
	var initParams={
		"period":"day",
		"type":"ERROR"
	};
  var params=require('url').parse(decodeURIComponent(req.url),true).query;
  var aggParams=Object.assign({},initParams,params);

	var queryStart=new Date();
	if (aggParams.period=='hour') {
		queryStart.setHours(queryStart.getHours() - 1);
	    aggParams._groupID={
		    	"year":{$year:"$timestamp_minute"},
		    	"month":{$month:"$timestamp_minute"},
				"day":{$dayOfMonth:"$timestamp_minute"},
				"hour":{$hour:"$timestamp_minute"},
				"minute":{$minute:"$timestamp_minute"}
			}
	}else if (aggParams.period=='week') {
		queryStart.setDate(queryStart.setDate() - 7);
	    aggParams._groupID={
		    	"year":{$year:"$timestamp_minute"},
		    	"month":{$month:"$timestamp_minute"},
				"day":{$dayOfMonth:"$timestamp_minute"}
			}
	}else{
		queryStart.setHours(queryStart.getHours() - 24);
	    aggParams._groupID={
		    	"year":{$year:"$timestamp_minute"},
		    	"month":{$month:"$timestamp_minute"},
				"day":{$dayOfMonth:"$timestamp_minute"},
				"hour":{$hour:"$timestamp_minute"},
			}
	}
	aggParams._queryStart=queryStart;

    db.CounterModel.aggregate([
		    {		
			    $project: { 
			        "total_nums":1,
			        "type":1,
			        "timestamp_minute": { $add: [ "$timestamp_minute", 8*60*60000 ] }
			    }
		    },
            { 
                $match: {
                    "type":aggParams.type,
                    "timestamp_minute": {$gte: aggParams._queryStart}
                } 
            },
            { 
                $group : {
                    _id: aggParams._groupID,
                    count: { $sum: '$total_nums' }
                }
            },
            { $sort: { _id: 1 } }
        ],
        function (err,result){
            if (err) {
            	console.log(err);
            	return res.sendStatus(500);
            }
            res.json(result);
        }
    );   
}