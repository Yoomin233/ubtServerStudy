var db = require('../db/model.js');
var conn = require('../db/mongodb.js');
conn.init();

var d=new Date();
var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0);
dStartTime.setMinutes(dStartTime.getMinutes()-10);


var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), 0);
dEndTime.setMinutes(dEndTime.getMinutes()-1);

db.PVModel.findOne({"static.appName":"MyPage","static.visitTime":{"$gte":dStartTime,"$lt":dEndTime}},function(err,doc){
	if (err) {console.log(err);return;}
	console.log(doc);
});