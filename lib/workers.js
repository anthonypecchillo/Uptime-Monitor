// --------------------
// Worker-related tasks
// --------------------

// Dependencies
var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');
var https = require('https');
var _data = require('./data');
var helpers = require('./helpers');

// Instantiate the worker object
var workers = {};

// Look up all checks, get their data, send to validator
workers.gatherAllChecks = function() {
  // Get all the checks
  _data.list('checks', function(err, checks) {
    if (!err && checks && checks.length > 0) {
      checks.forEach(function(check) {
        // Read in the check data
        _data.read('checks', check, function(err, originalCheckData) {
          if (!err && originalCheckData) {
            // Pass originalCheckData to the check validator and let that function continue or log errors as needed
            workers.validateCheckData(originalCheckData);
          } else {
            console.log('Error: Error reading one of the check\'s data');
          }
        });
      });
    } else {
      console.log('Error: Could not find any checks to process.');  // Because this is a background worker, there is no caller to callback a response to!
    }
  });
};

// Timer to execute the worker-process once per minute
workers.loop = function() {
  setInterval(function() {
    workers.gatherAllChecks();
  }, 1000 * 60);
};



// Export the module
module.exports = workers;
