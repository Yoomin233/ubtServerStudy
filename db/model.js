var mongoose      = require('mongoose');
var timestamps    = require('mongoose-timestamp');
var bcrypt        = require('bcrypt');

var SALT_WORK_FACTOR = 10;
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
  custom: { type: Schema.Types.Mixed,default:{}}
});
var TraceModel = mongoose.model('Trace', TraceSchema);

var PVSchema = new Schema({
  meta: {
    version:{ type: String, default: ''},
    state:['PENDING','FINISH','TIMEOUT']
  },
  static: {
    pvId:{ type: String, default: ''},//格式：platform-appName-appVersion-pathname-hash-title-custom
    prePV:{
      pvId:{ type: String, default: ''}
    },
    uId:{ type: String, default: ''},
    deviceId:{ type: String, default: ''},
    client:{
      platform:['H5','ANDROID','IOS','WEICHAT','RN','HYBRID'],
      appVersion:{ type: String, default: ''}
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
  business: { type: Schema.Types.Mixed,default:{}},
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
      // 客户端对entry不做过多过滤，会把每个entry发过来(字段值有name和duration),一分钟内重复的取duration大的
      {
        _id: false,
        name: { type: String }, //resource的文件url
        duration: { type: Number } //resource的耗时的最大值（用于多次请求）
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
var CounterModel = mongoose.model('Counter', CounterSchema);

var ReportResultSchema = new Schema({ 
  report: { type: Schema.Types.Mixed,default:{}}
});
ReportResultSchema.plugin(timestamps)
var ReportResultModel = mongoose.model('ReportResult', ReportResultSchema);

var UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:{ type: Number, default: 2 } // 1:all, 2: query
});
UserSchema.plugin(timestamps);
UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
  });
});
UserSchema.methods.comparePassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};
var UserModel = mongoose.model('User', UserSchema);

exports.CounterModel = CounterModel;
exports.ConfigModel = ConfigModel;
exports.TraceModel = TraceModel;
exports.PVModel = PVModel;
exports.UserModel = UserModel;
exports.ReportResultModel = ReportResultModel;

