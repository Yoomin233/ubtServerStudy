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
		deviseId:{ type: String, default: ''},
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
		performance: {type: Schema.Types.Mixed},
		clickLog:[],  //click元素
		inputInfo:[], //页面input, select元素的值（onblur, onchange event）
		unloadTime: { type: Date},
		pvState:{ type: String, default: ''},
		custom: { type: Schema.Types.Mixed}
	}
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
