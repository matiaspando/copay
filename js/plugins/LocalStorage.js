'use strict';

function LocalStorage() {
  this.type = 'DB';
};

LocalStorage.prototype.init = function() {
};

LocalStorage.prototype.setCredentials = function(email, password, opts) {
  this.email = email;
  this.password = password;
};

LocalStorage.prototype.getItem = function(k,cb) {
  return cb(null, localStorage.getItem(k));
};

LocalStorage.prototype.setItem = function(k,v,cb) {
  localStorage.setItem(k,v);
  return cb();
};

LocalStorage.prototype.removeItem = function(k,cb) { 
  localStorage.removeItem(k);
  return cb();
};

LocalStorage.prototype.clear = function(cb) { 
  localStorage.clear();
  return cb();
};

LocalStorage.prototype.allKeys = function(cb) {
  var l = localStorage.length;
  var ret = [];

  for(var i=0; i<l; i++)
    ret.push(localStorage.key(i));

  return cb(null, ret);    
};

module.exports = LocalStorage;