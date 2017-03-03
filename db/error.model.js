var mongoose = require('mongoose')

var ErrorsSchema = mongoose.Schema({
  time: Date,
  hash: String,
  msg: String,
  type: String
})

module.exports = {
  ErrorModel: mongoose.model('Errors', ErrorsSchema)
}