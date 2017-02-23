var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TestData = new Schema({ 
  num: Number
});
var testModel = mongoose.model('TestData', TestData);

exports.testModel = testModel;