var redis = require('redis');
var config = require('../config/index.js');
var redisClient = redis.createClient(6379,config.redis);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});

exports.redis = redis;
exports.redisClient = redisClient;