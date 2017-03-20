var redis = require('redis');
var config = require('../config/index.js');
var redisClient = redis.createClient(6379,config.redis);
if (process.env.NODE_ENV=='production') {
	redisClient.auth(process.env.REDIS_SECRET, function (err) { if (err) throw err; });
}
var bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});

exports.redis = redis;
exports.redisClient = redisClient;