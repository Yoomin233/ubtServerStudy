var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PV = new Schema({ 
  pv: Schema.Types.Mixed 
});
var pvModel = mongoose.model('PV', PV);

exports.pvModel = pvModel;