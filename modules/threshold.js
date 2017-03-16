"use strict";

var configAPI 	= require('./config.js');
var log       	= require('./log.js')();
var redisClient = require('./redis').redisClient;

function updateThreshold(){
	configAPI._q("threshold",function(err,doc){
		if (err) {
		  log.error(err);
		  return;
		}
		redisClient.set("min-error-limit",doc.value["min-error-limit"])
		redisClient.getAsync("min-error-limit").then(function(res){
			log.info("error threshold:%s",res);
		});
		
	});	
}

exports.updateThreshold=updateThreshold;



