var config = require('../config/index.js');
var mongoose = require('mongoose');

exports.init=function(){
	mongoose.connect(config.db, {}, function (err, res) {
	    if (err) { 
	        console.log('Connection refused to ' + config.db);
	        console.log(err);
	    } else {
	        console.log('Connection successful to: ' + config.db);
	    }
	});	
}

