var chai = require('chai');
var expect = chai.expect;
var pv = require('../modules/pv.js');
var chance = require('chance').Chance();
var moment  = require('moment');

function randomPV(){
	var sHour=chance.integer({min: 1, max: 10});
	var randomTimestamp=moment().subtract(sHour,'hours').valueOf();
	var visitTime = new Date(2017,3,10,9);

	var mockPV={
		meta:{
		  	version:"0.0.1"
		},
		static: {
			pvId:"h5-liveroom-1.0.0-abc/123-直播室-room1", //格式：platform-appName-appVersion-window.location.pathname-title-custom
			uid:"7778800",
			prePv:{ 
				pvId:""
			},
			deviceId:"123",
			client:{ 
				platform:"H5",
				version:"1.0.0"
			},
			appName:"liveroom",
			visitTime: visitTime,
			href:"http://test.v.dx168.com/static/html/dxpc/open.html?serverId=14",
			userAgent: { 
				os:"mac",
				browser:"chrome"
			},
			title:"直播室"
		},
		dynamic: {
			pvState:"FINISH",
			unloadTime:visitTime.getTime(),
			clickLog:[{"id":"abc"}],
			performance:{
				startTime:visitTime
			}
		}
	};

	console.log(JSON.stringify(mockPV));

	var http = require('http');
	var querystring = require("querystring");
	var queryStr=encodeURIComponent(JSON.stringify(mockPV));
	var url="http://localhost:8080/ubt/pv.gif?"+queryStr;
	//var url="http://192.168.19.172:8080/ubt/pv.gif?"+queryStr;

	var req = http.get(url, function(res) {
	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = Buffer.concat(bodyChunks);
	  })
	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});
}

describe("pvsave", function() {

  it("save pv", function() {
  	randomPV();
    expect(true).to.equal(true);
  });

});