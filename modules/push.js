
var request = require('request');

var AppKey = '98af1bff0dcfdf220b9dc8a7';
var MasterSecret = process.env.JIGUANG_MasterSecret;
console.log(MasterSecret)
var auth = 'Basic ' + new Buffer(AppKey + ':' + MasterSecret).toString('base64');
console.log(auth)
exports.push=function(msg){
	var _msg=msg;
	var options = {
		method:'POST',
	  	url: 'https://api.jpush.cn/v3/push',
		headers: {
		    "Content-Type": "application/json",
		    'Authorization': auth
		},
		json:{ 
			    "platform": ["android"],
			    "audience": "all",
			    "notification" : {
			        "android" : {
			             "alert" : _msg, 
			             "title" : "JPush test", 
			             "builder_id" : 3, 
			             "style":1,
			             "big_text":"big text content",
			             "inbox":{},
			             "big_pic_path":"picture url",
			             "priority":0,
			             "category":"category str",
			             "extras" : {
			                  "news_id" : 134, 
			                  "my_key" : "a value"
			             }
			        }
			    },
			    "options": {
			        "time_to_live": 60,
			        "apns_production": false
			    }
		}
	};

	function callback(error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body);
	  }else{
	  	console.log(error);
	  }
	}

	request(options, callback);
}




