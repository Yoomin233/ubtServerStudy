var mongoose = require('mongoose');
var timestamps   = require('mongoose-timestamp');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({ 
  key: { type: String, required: true},
  value: {type:Schema.Types.Mixed}
});
var ConfigModel = mongoose.model('Config', ConfigSchema);

var TraceSchema = new Schema({
  pvId: { type: String, default: ''},
  appName: { type: String, default: 'DX'},
  time: { type: Date, required: true},
  level: ['FATAL','ERROR','WARN','INFO','DEBUG'],
  msg: { type: String, default: ''},
  error: {
    errorMessage: { type: String, default: ''},
    scriptURI: { type: String, default: ''},
    lineNumber: { type: Number, default: -1},
    errorObj: { type: Schema.Types.Mixed},
  }
});
var TraceModel = mongoose.model('Trace', TraceSchema);

var PVSchema = new Schema({
  meta: {
    version:{ type: String, default: ''},
    state:['PENDING','FINISH','TIMEOUT']
  },
  static: {
    pvId:{ type: String, default: ''},//格式：platform-appName-appVersion-window.location.pathname-title-custom
    uid:{ type: String, default: ''},
    prePV:{
      pvId:{ type: String, default: ''}
    },
    deviceId:{ type: String, default: ''},
    client:{
      platform:['H5','ANDROID','IOS','WEICHAT','RN','HYBRID'],
      version:{ type: String, default: ''}
    },
    appName:{ type: String, default: 'DX'},
    visitTime: { type: Date, required: true},
    geolocation: {
      latitude: { type: Number},
      longitude: { type: Number}
    },
    href:{ type: String, default: ''},
    referrer:{ type: String, default: ''},
    userAgent: { type: Schema.Types.Mixed},
    title:{ type: String, default: ''}
  },
  dynamic: {
    performanceTiming: {
      readyStart: { type: Number }, //上个页面unload到浏览器开始处理当前页面fetchStart的耗时
      redirecTime: { type: Number }, //重定向耗时
      appcacheTime: { type: Number }, //fetchStart到domainLookupStart的耗时
      lookupDomainTime: { type: Number }, //DNS查询耗时
      connectTime: { type: Number }, // TCP连接耗时
      requestTime: { type: Number }, //第一个request的耗时
      initDomTreeTime: { type: Number }, //请求完毕至dom加载
      domReadyTime: { type: Number }, //解析dom树耗时
      loadEventTime: { type: Number }, //loadEventEnd - loadEventStart
      totalTime: { type: Number} //loadEventEnd - fetchStart
    },
    performanceEntries: [
      {
        name: { type: String }, //resource的文件url
        minDuration: { type: Number }, //resource的耗时的最大值和最小值（用于多次请求）
        maxDuration: { type: Number },
        totalNum: { type: Number, default: 1 }, //相同的resource请求的次数
      }
    ],
    clickLog:[],  //click元素
    inputInfo:[], //页面input, select元素的值（onblur, onchange event）
    unloadTime: { type: Date, default: new Date()},
    pvState:{ type: String, required: true},
    custom: { type: Schema.Types.Mixed,default:{}}
  },
  _id:{ type: String} //pvId+visitTime+deviceId+uid
});
PVSchema.plugin(timestamps);
var PVModel = mongoose.model('PV', PVSchema);

var CounterSchema = new Schema({ 
  timestamp_minute : { type : Date, required: true}, //时间戳到分
  total_nums: { type: Number, default: 0, required: true},//总数
  num_samples:{ type: Number, default: 0, required: true},//样本数
  type: ['ERROR','PV'],// 计数类型
  values:[]// 样本值
});
var CounterModel = mongoose.model('CounterReport', CounterSchema);

exports.CounterModel = CounterModel;
exports.ConfigModel = ConfigModel;
exports.TraceModel = TraceModel;
exports.PVModel = PVModel;
