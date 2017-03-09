var db = require('../db/model.js');

function _callback(res){
	var _res = res;
	return function(err, doc){
		if (err) {
		  return _res.sendStatus(500);
		}
		_res.json(doc);
	}
}

exports.update = function(req, res) {
	var doc = req.body||'';
	if (doc == '') {
		return res.sendStatus(400);
	}

	var key = req.body.key || '';

	if (key != '') {
		db.ConfigModel.update(
		  { 
		    "key": key
		  }, 
		  doc, 
		  {safe: true, upsert: true},
		  _callback(res)
	  	);
	}else{
		return res.sendStatus(400);
	}
}

exports.q = function(req, res) {
    var key = req.params.configKey || '';

	if (key != '') {
		db.ConfigModel.findOne({"key":key},_callback(res));
	}else{
		return res.sendStatus(400);
	}
}