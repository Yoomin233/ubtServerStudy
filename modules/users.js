var db = require('../db/model.js');
var jwt = require('jsonwebtoken');
var redisClient = require('./redis').redisClient;
var tokenManager = require('./token.manager');
var secret = require('../config/secret');

exports.signin = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	
	if (username == '' || password == '') { 
		return res.sendStatus(401); 
	}

	db.UserModel.findOne({username: username}, function (err, user) {
		if (err) {
			console.log(err);
			return res.sendStatus(401);
		}

		if (user == undefined) {
			return res.sendStatus(401);
		}
		
		user.comparePassword(password, function(isMatch) {
			if (!isMatch) {
				console.log("Attempt failed to login with " + user.username);
				return res.sendStatus(401);
            }

			var token = jwt.sign({id: user._id,role:user.role}, secret.secretToken, { expiresIn: tokenManager.TOKEN_EXPIRATION });
			
			return res.json({token:token,user:user});
		});

	});
};

exports.logout = function(req, res) {
	if (req.user) {
		tokenManager.expireToken(req.headers);

		delete req.user;	
		return res.sendStatus(200);
	}
	else {
		return res.sendStatus(401);
	}
}

exports.register = function(req, res) {
	var username = req.body.username || '';
	var password = req.body.password || '';
	var passwordConfirmation = req.body.passwordConfirmation || '';

	if (username == '' || password == '' || password != passwordConfirmation) {
		return res.sendStatus(400);
	}

	var user = new db.UserModel();
	user.username = username;
	user.password = password;

	user.save(function(err) {
		if (err) {
			console.log(err);
			return res.sendStatus(500);
		}	
		
		return res.sendStatus(200);
	});
}