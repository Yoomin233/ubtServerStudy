var db = require('../db/model.js');
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

exports.aggregate =function(req,res){
  var script = req.body||'';
  if (script == '') {
		return res.sendStatus(400);
	}

	_aggByScript(script,function (err,result){
    if (err) {
    	console.log(err);
    	return res.sendStatus(500);
    }
    console.log(result);
    res.json(result);
  });
}
