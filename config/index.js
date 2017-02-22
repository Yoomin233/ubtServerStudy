'use strict';

var path = require('path');
var extend = require('util')._extend;

var priAli = require('./env/private.js');
var test = require('./env/test.js');

var notifier = {
};

var defaults = {
  root: path.join(__dirname, '..'),
  notifier: notifier
};

module.exports = {
  priAli: extend(priAli, defaults),
  test: extend(test, defaults)
}[process.env.NODE_ENV || 'test'];
