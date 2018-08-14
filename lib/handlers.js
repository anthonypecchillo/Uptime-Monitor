// ----------------
// Request handlers
// ----------------

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// Define the handlers
var handlers = {};

// Users handler
handlers.users = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  var requestedMethod = data.method.toLowerCase();

  if (acceptableMethods.indexOf(requestedMethod) > -1) {
    handlers._users[requestedMethod](data, callback);
  } else {
    callback(405);  // Method not allowed
  }
};


// Ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Export the module
module.exports = handlers;