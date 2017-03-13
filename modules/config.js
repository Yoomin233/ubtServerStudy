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

function _q(key,cb){
	db.ConfigModel.findOne({"key":key},cb);
}

function _update(key,value,cb){
	var _key=key;
	var _value=value;
	db.ConfigModel.update(
	  { 
	    "key": _key
	  }, 
	  _value, 
	  {safe: true, upsert: true},
	  cb
  	);	
}

exports.update = function(req, res) {
	var doc = req.body||'';
	if (doc == '') {
		return res.sendStatus(400);
	}

	var key = req.body.key || '';

	if (key != '') {
		return _update(key,doc,_callback(res));
	}else{
		return res.sendStatus(400);
	}
}

exports.q = function(req, res) {
    var key = req.params.configKey || '';

	if (key != '') {
		return _q(key,_callback(res));
	}else{
		return res.sendStatus(400);
	}
}

exports._q = _q;
exports._update = _update;