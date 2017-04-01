var db = require('../db/model.js');
require('../db/mongodb.js').init();

function _q(){
	db.ReportResultModel.find({
		'static.appName':'新手教程',
		'reportName':'MR-PVUV',
		'period':'day',
    	'startTime':{'$gte':new Date('2017-03-25')},
    	'dEndTime':{'$lt':new Date('2017-04-01')} 
    },function(err,doc){
    	if (err) {
    		console.log(err)
    	}
    	console.log(doc)
    });
}


_q();