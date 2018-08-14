// ------------------------
// Primary file for the API
// ------------------------

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// ------------------------------------------------------------
// TESTING
// ------------------------------------------------------------
// @TODO delete this
// _data.create('test', 'newFile', {'foo': 'bar'}, function(err) {
//   console.log('This was the error: ', err);
// });

// @TODO delete this
// _data.read('test', 'newFile', function(err, data) {
//   console.log('This was the error: ', err, ' and this was the data: ', data);
// });

// @TODO delete this
// _data.update('test', 'newFile', {'fizz': 'buzz'}, function(err) {
//   console.log('This was the error: ', err);
// });

// @TODO delete this
// _data.delete('test', 'newFile', function(err) {
//   console.log('This was the error: ', err);
// });
// ------------------------------------------------------------


// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function() {
  console.log(`The HTTP server is listening on port ${config.httpPort} in ${config.envName} mode...`);
});


// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpServer.listen(config.httpsPort, function() {
  console.log(`The HTTPS server is listening on port ${config.httpsPort} in ${config.envName} mode...`);
});


// All the server logic for both the http and https server
var unifiedServer = function(req, res) {

  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true);
  
  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');    // Trims off the slashes from both sides
                                                       // (Helps us to handle requests to /foo and /foo/ equally.)
  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
 
  // Get the HTTP method
  var method = req.method.toUpperCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get payload, if any exists
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  req.on('end', function() {
    buffer += decoder.end();
    
    // Choose the handler this request should go to.  
    // If one is not found, use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJSONToObject(buffer)
    };


    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // Use the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    
      // Log the request path
      console.log('Returning this response: ', statusCode, payloadString);
    });

  });
};


// Define a request router
var router = {
  'ping': handlers.ping,
  'users': handlers.users
};
