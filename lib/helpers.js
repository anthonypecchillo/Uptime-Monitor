// -------------------------
// Helpers for various tasks
// -------------------------

// Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');

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

// Send an SMS message via Twilio
helpers.sendTwilioSMS = function(phone, msg, callback) {
  // Validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;  // 1600 character max for SMS via Twilio API

  if (phone && msg) {
    // Configure the request payload
    var payload = {
      'From': config.twilio.fromPhone,
      'To': ('+1' + phone),
      'Body': msg
    };

    // Stringify the payload
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)     // The Buffer module is a nodejs global
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function(res) {
      // Grab the status of the sent request
      var status = res.statusCode;
      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(false);                                       // Using error back pattern. No error, so false.
      } else {
        callback('Twilio Request - Status code returned was: ' + status);
      }
    });

    // Bind to the error event so an error does not get thrown
    req.on('error', function(err) {
      callback(err);
    });

    // Add the payload to the request
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid.');
  }
};














// Export the module
module.exports = helpers;