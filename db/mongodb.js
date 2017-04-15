var config = require('../config/index.js');
var mongoose = require('mongoose');

// change default promise lib
mongoose.Promise = global.Promise;
exports.init= function(next) {
	return mongoose.connect(config.db, {})
	.then((res) => {
		console.log('Connection successful to: ' + config.db);
		next && next(res)
	})
	.catch((e) => {
		console.log('Connection refused to ' + config.db);
		console.log(e);
	})
}
	// mongoose.connect(config.db, {}, function (err, res) {
	//     if (err) {
	//         console.log('Connection refused to ' + config.db);
	//         console.log(err);
	//     } else {
	//         console.log('Connection successful to: ' + config.db);
	//     }
	// });
