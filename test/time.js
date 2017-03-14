var db = require('../db/model.js');
var conn = require('../db/mongodb.js');
conn.init();

var d=new Date();
var dStartTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
dStartTime.setHours(dStartTime.getHours());


var dEndTime=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0);
dEndTime.setHours(dEndTime.getHours()+1);

console.log(dStartTime);
console.log(dEndTime);

db.PVModel.findOne({"static.appName":"newP","static.visitTime":{"$gte":dStartTime,"$lt":dEndTime}},function(err,doc){
	if (err) {console.log(err);return;}
	console.log(doc);
});