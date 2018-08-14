// ------------------------------------
// Library for storing and editing data
// ------------------------------------

// Dependencies
var fs = require('fs');
var path = require('path');

// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, filename, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + filename + '.json', 'wx', function(err, fileDescriptor)  {   // 'wx' Open for writing, error if file DOES already exist
    if (!err && fileDescriptor) {
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, function(err) {
        if (!err) {
          fs.close(fileDescriptor, function(err) {
            if (!err) {
              callback(false);
            } else {
              callback('Error closing new file.');
            }
          });
        } else {
          callback('Error writing to new file.');
        }
      });
    } else {
      callback('Could not create new file. It may already exist.');
    }
  });
};

// Read data from a file
lib.read = function(dir, filename, callback) {
  fs.readFile(lib.baseDir + dir + '/' + filename + '.json', 'utf-8', function(err, data) {
    if (!err) {
      callback(false, data);
    } else {
      callback('Error reading the file.');
    }
  });
};

// Update data inside a file
lib.update = function(dir, filename, data, callback) {
  // Open the file for writing
  fs.open(lib.baseDir + dir + '/' + filename + '.json', 'r+', function(err, fileDescriptor) {   // 'r+' Open for writing, error if file does NOT exist
    if (!err && fileDescriptor) {
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Truncate the file
      fs.truncate(fileDescriptor, function(err) {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, function(err) {
            if (!err) {
              //Close the file
              fs.close(fileDescriptor, function(err) {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing existing file.');
                }
              });
            } else {
              callback('Error writing to existing file.');
            }
          });
        } else {
          callback('Error truncating existing file.');
        }
      });
    } else {
      callback('Could not open the file for updating.  It may not exist yet.')
    }
  });
};

// Delete a file
lib.delete = function(dir, filename, callback) {
  fs.unlink(lib.baseDir + dir + '/' + filename + '.json', function(err) {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file.');
    }
  });
};

// Export the module
module.exports = lib;