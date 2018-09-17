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



// Export the module
module.exports = workers;
