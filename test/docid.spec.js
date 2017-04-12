var chai = require('chai');
var expect = chai.expect;
var pv = require('../modules/pv.js');
var db = require('../db/model.js');
var index = require('../index.js');
const request = require('supertest');
var chance = require('chance').Chance();
var moment  = require('moment');

function randomStr(){
	return Math.random().toString(36).substr(2);
}

describe("docid suite", function() {

  /*
  	docid生成规则:pvid+visitTime+deviceId
  	check point:
	1. docid 规则正确
	2. docid 正确保存
	3. docid 唯一
	4. pv其他字段不影响docid生成
  */
  it("Case-> docid正确生成", function(done) {

  	this.timeout(5000);
    var visitTime=new Date().getTime();
    var pvid="--"+randomStr()+"--";
    var deviceId="--"+randomStr()+"--";

	var sHour=chance.integer({min: 1, max: 10});
	var randomTimestamp=moment().subtract(sHour,'hours').valueOf();

	var mockPV={
		meta:{
		  	version:"0.0.1"
		},
		static: {
			pvId:pvid,
			prePv:{ 
				pvId:""
			},
			deviceId:deviceId,
			client:{ 
				platform:"H5",
				version:"1.0.0"
			},
			appName:"rrr",
			visitTime: visitTime,
			href:"http://test.v.dx168.com/static/html/dxpc/open.html"+randomStr(),
			userAgent: { 
				os:"mac",
				browser:"chrome"
			},
			title:randomStr()
		},
		dynamic: {
			pvState:"FINISH",
			unloadTime:randomTimestamp,
			clickLog:[{"id":"abc"}],
			performance:{
				startTime:visitTime
			}
		}
	};

	var querystring = require("querystring");
	var queryStr=encodeURIComponent(JSON.stringify(mockPV));
	var url="/ubt/pv.gif";
	var docid=pvid+visitTime+deviceId;
	console.log("docid:"+docid)
    request(index.app)
      .get(url)
      .query(queryStr)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
		db.PVModel.find({_id:docid }, function (err, pvDoc) {
			if (err) {
				done(err);
			}
			expect(pvDoc.length).to.equal(1);
			done();
		});
      });
  });

  it("Case-> docid 不能为空", function(done) {
  	this.timeout(5000);
    var visitTime="";
    var pvid="";
    var deviceId="";

	var sHour=chance.integer({min: 1, max: 10});
	var randomTimestamp=moment().subtract(sHour,'hours').valueOf();

	var mockPV={
		meta:{
		  	version:"0.0.1"
		},
		static: {
			pvId:pvid,
			prePv:{ 
				pvId:""
			},
			deviceId:deviceId,
			client:{ 
				platform:"H5",
				version:"1.0.0"
			},
			appName:"rrr",
			visitTime: visitTime,
			href:"http://test.v.dx168.com/static/html/dxpc/open.html"+randomStr(),
			userAgent: { 
				os:"mac",
				browser:"chrome"
			},
			title:randomStr()
		},
		dynamic: {
			pvState:"FINISH",
			unloadTime:randomTimestamp,
			clickLog:[{"id":"abc"}],
			performance:{
				startTime:visitTime
			}
		}
	};

	var querystring = require("querystring");
	var queryStr=encodeURIComponent(JSON.stringify(mockPV));
	var url="/ubt/pv.gif";
	var docid=pvid+visitTime+deviceId;
	console.log("docid:"+docid)
    request(index.app)
      .get(url)
      .query(queryStr)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

});