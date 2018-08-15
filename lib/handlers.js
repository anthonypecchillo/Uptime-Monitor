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

// Container for all the tokens sub-methods
handlers._tokens = {};

// Tokens - POST
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data, callback) {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    // Look up the user who matches that phone number
    _data.read('users', phone, function(err, userData) {
      if (!err && userData) {
        // Hash the provided password and compare it to the password stored in the user object
        var hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // Create a new token with a random name. Set expiration date one hour in the future.
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          _data.create('tokens', tokenId, tokenObject, function(err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, {'Error': 'Could not create the new token.'});
            }
          });

        } else {
          callback(400, {'Error': 'Password did not match the specified user\'s stored password.'});
        }
      } else {
        callback(400, {'Error': 'Could not find the specified user.'});
      }
    });
    // 
  } else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Tokens - GET
// Required data: id
// Optional data: none
handlers._tokens.get = function(data, callback) {
  // Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id : false;

  if (id) {
    // Look up the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Tokens - PUT
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function(data, callback) {
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;  
  
  if (id && extend) {
    // Look up the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration to one hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update('tokens', id, tokenData, function(err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {'Error': 'Could not update the token\'s expiration.'});
            }
          });
        } else {
          callback(400, {'Error': 'The token has already expired and cannot be extended.'});
        }
      } else {
        callback(400, {'Error': 'Specified token does not exist.'});    
      }
    });
  } else {
    callback(400, {'Error': 'Missing required field(s) or field(s) are invalid.'});
  }
};

// Tokens - Delete
// Required data: id
// Optional data: none
handlers._tokens.delete = function(data, callback) {
  // Check that the id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    // Look up the token
    _data.read('tokens', id, function(err, tokenData) {
      if (!err && tokenData) {
        _data.delete('tokens', id, function(err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, {'Error': 'Could not delete the specified token.'});
          }
        });
      } else {
        callback(400, {'Error': 'Could not find the specified token.'});
      }
    });

  } else {
    callback(400, {'Error': 'Missing required field.'});
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