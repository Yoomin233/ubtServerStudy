var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = new Schema({ 
  key: { type: String, required: true},
  value: Schema.Types.Mixed
});
var configModel = mongoose.model('Config', Config);

exports.configModel = configModel;