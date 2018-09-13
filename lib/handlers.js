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

// Container for the Users sub-methods
handlers._users = {};

// Users - POST
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, function(err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if (hashedPassword) {
          var userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashedPassword': hashedPassword,
            'tosAgreement': true
          };

          // Store the user
          _data.create('users', phone, userObject, function(err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error': 'Could not create the new user.'});
            }
          });
        } else {
          callback(500, {'Error': 'Could not hash the user\'s password.'});
        }
      } else {
        // User already exists
        callback(400, {'Error': 'A user with that phone number already exists.'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields.'});
  } 
};

// Users - GET
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone else's.
handlers._users.get = function(data, callback) {
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Look up the user
    _data.read('users', phone, function(err, userData) {
      if (!err && userData) {
        // Remove hashedPassword from user object before returning it to requester
        delete userData.hashedPassword;
        callback(200, userData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Users - PUT
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO: Only let an authenticated user update their own object. Don't let them update anyone else's.
handlers._users.put = function(data, callback) {
  // Check for the required field
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
 
  // Check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Look up the user
      _data.read('users', phone, function(err, userData) {
        if (!err && userData) {
          // Update fields that are necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.password = helpers.hash(password);
          }

          // Store the new updates
          _data.update('users', phone, userData, function(err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error': 'Could not update the user.'});
            }
          })
        } else {
          callback(400, {'Error': 'The specified user does not exist.'});
        }
      });
    } else {
      callback(400, {'Error': 'Missing fields to update.'});
    }
  } else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Users - DELETE
// Required data: phone
// Optional data: none
// @TODO: Only let an authenticated user delete their object. Don't let them delete anyone else's.
// @TODO: Clean up (delete) any other data files associated with this user.
handlers._users.delete = function(data, callback) {
  // Check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Look up the user
    _data.read('users', phone, function(err, userData) {
      if (!err && userData) {
        _data.delete('users', phone, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Error': 'Could not delete the specified user.'});
          }
        })
      } else {
        callback(400, {'Error': 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Tokens handler
handlers.tokens = function(data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  var requestedMethod = data.method.toLowerCase();
  
  if (acceptableMethods.indexOf(requestedMethod) > -1) {
    handlers._tokens[requestedMethod](data, callback);
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