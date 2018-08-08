// ------------------------
// Primary file for the API
// ------------------------

// Dependencies
var http = require('http');
var url = require('url');

// The server should respond to all requests with a string
var server = http.createServer(function(req, res) {
      
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

  // Send the response
  res.end('Hello World!\n');

  // Log the request path
  console.log('Request received on path: ', trimmedPath, ' with method: ', method, ' with query string parameters: ', queryStringObject);
  console.log('Request received with the following headers: ', headers);
});


// Start the server and have it listen on port 3000
server.listen(3000, function() {
  console.log('The server is listening on port 3000...');
});