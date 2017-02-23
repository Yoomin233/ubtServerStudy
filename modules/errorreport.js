var db = require('../db/report.model.js');

exports.increaseErrorSample = function(){
	var d=new Date();
	var dMinute=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0);

	db.counterReport.update(
	  { 
	    timestamp_minute: dMinute,
	    type: "ERROR"
	  }, 
	  {
	    $inc: {num_samples: 1, total_nums: 1 }
	  }, 
	  {safe: true, upsert: true},
	  function(err, doc){
	    if (err) {
	      console.log(err);
	    }
	    console.log(doc);
  	  }
  	);
}

exports.aggregate =function(req,res){
    db.counterReport.aggregate([
		    {
			    $project: { 
			        "total_nums":1,
			        "type":1,
			        "timestamp_minute": { $add: [ "$timestamp_minute", 8*60*60000 ] }
			    }
		    },
            { 
                $match: {
                    "type":"ERROR"
                } 
            },
            { 
                $group : {
                    _id: {
			            hour: { $hour: "$timestamp_minute" },
			            day: { $dayOfMonth: "$timestamp_minute" }, 
			            month: { $month: "$timestamp_minute" },  
			            year: { $year: "$timestamp_minute" } 
                    },
                    count: { $sum: '$total_nums' }
                }
            },
            { $sort: { _id: 1 } }
        ],
        function (err,result){
            if (err) {return res.sendStatus(500);}
            res.json(result);
        }
    );   
}

