// -------------------------
// Helpers for various tasks
// -------------------------

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for all the helpers
var helpers = {};


// Create a SHA256 hash
helpers.hash = function(str) {
  if (typeof(str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJSONToObject = function(str) {
// The reason we need this is because natively Node or Javascript will throw an error if the JSON.parse() function
// tries to parse something that isn't valid JSON, and we don't want errors to be thrown.
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(err) {
    return {};
  }
};

// Create a string of random alphnumeric characters, of a given length 
helpers.createRandomString = function(strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for (var i = 0; i < strLength; i++) {
      // Get a random character from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * 35));
      // Append this character to the final string
      str += randomCharacter;
    }

    // Return the final string
    return str;

  } else {
    return false;
  }
};









// Export the module
module.exports = helpers;