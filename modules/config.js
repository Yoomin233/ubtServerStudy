var db = require('../db/config.model.js');

exports.update = function(req, res) {
	var doc = req.body||'';
	if (doc == '') {
		return res.sendStatus(400);
	}

	var key = req.body.key || '';

	if (key != '') {
		db.configModel.update(
		  { 
		    "key": key
		  }, 
		  doc, 
		  {safe: true, upsert: true},
		  function (err, doc){
				if (err) {
				  return res.sendStatus(500);
				}
				res.json(doc);
			}
	  	);
	}else{
		return res.sendStatus(400);
	}
}

exports.q = function(req, res) {
	var queryStr=require('url').parse(req.url).query || '';
	if (queryStr == '') {
		return res.sendStatus(400);
	}

    var key = JSON.parse(decodeURIComponent(queryStr)).key || '';

	if (key != '') {
		db.configModel.findOne({"key":key},function (err, doc){
				if (err) {
				  return res.sendStatus(500);
				}
				res.json(doc);
			});
	}else{
		return res.sendStatus(400);
	}
}