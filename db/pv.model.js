var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PV = new Schema({
  pv: {
    prepv: {},
    pvmeta: String,
    deviseId: String,
    pvId: String,
    version: String, // ubt-client的version
    static: {
      appName: String,
      visitTime: Date, // 用户访问时间点
      geolocation: {latitude: Number, longitude: Number}, // 用户地点
      href: String,
      // title: String, // document.title
      referrer: String,
      userAgent: {},
      performanceTiming: {}
    },
    dynamic: {
      clickLog: [{
        id: { type: String, default: ''},
        msg: String7
      }], // 主动埋点的click元素
      inputInfo: [{
        text: String,
        value: String
      }], // 页面input, select元素的值（onblur, onchange event）
      added: {}
      // 保留字段
    }
  }
});
var pvModel = mongoose.model('PV', PV);

exports.pvModel = pvModel;