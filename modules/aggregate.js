function UBTAggregate(collection) {
  if(!(this instanceof UBTAggregate))
    return new UBTAggregate(collection);

  this._col = collection;
  this._aggregation = [];
}

var pipelineOps = ['project', 'match', 'limit', 'skip','unwind', 'group', 'sort'];

pipelineOps.forEach(function(op) {
  var key = '$' + op;
  UBTAggregate.prototype[op] = function(opt, cb) {
    var obj = {};
    obj[key] = opt;
    this._aggregation.push(obj);

    if(cb)
      this.exec(cb);

    return this;
  };
});

UBTAggregate.prototype.wrap = function(Model) {
  this._wrapper = Model;
  return this;
};

UBTAggregate.prototype.collection = function(newCol) {
  this._col = newCol;
  return this;
};

UBTAggregate.prototype.exec = function(cb) {
  var self = this;
  this._col.aggregate(this._aggregation, function(err, resp) {
    if(self._wrapper) resp = new self._wrapper(resp);
    cb(err, resp);
  });
  return this;
};

UBTAggregate.prototype.then = function(success, fail) {
  this.exec(function(err, res) {
    if (err) return fail(err);
    return success(res);
  });
};

module.exports = UBTAggregate;
