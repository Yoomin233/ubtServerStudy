var winston = require('winston');

module.exports = function logFactory(){
	var logger = new (winston.Logger)({
		transports: [
		  new (winston.transports.Console)(),
		  new (winston.transports.File)({ filename: 'ubt.log' })
		]
	});	
	return logger;
}