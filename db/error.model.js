var mongoose = require('mongoose')

var ErrorsSchema = mongoose.Schema({
  time: Date,
  hash: String,
  msg: String,
  type: String
})

module.exports = {
  Zqmodel: mongoose.model('Errors', ErrorsSchema)
}