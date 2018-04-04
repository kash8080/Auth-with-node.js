function IncompleteDataError (error) {
  this.name = "IncompleteDataError";
  this.message ='Fill all fields';
  Error.call(this, error.message);
  Error.captureStackTrace(this, this.constructor);
  this.code = error;
  this.status = 401;
}

IncompleteDataError.prototype = Object.create(Error.prototype);
IncompleteDataError.prototype.constructor = IncompleteDataError;

module.exports = IncompleteDataError;
