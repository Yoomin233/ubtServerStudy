var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterReport = new Schema({ 
  timestamp_minute : { type : Date, required: true}, //时间戳到分
  total_nums: { type: Number, default: 0, required: true},//总数
  num_samples:{ type: Number, default: 0, required: true},//样本数
  type: ['ERROR','PV'],// 计数类型
  values:[]// 样本值
});

var counterReport = mongoose.model('CounterReport', CounterReport);

exports.counterReport = counterReport;