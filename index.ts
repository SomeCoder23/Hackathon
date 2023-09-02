var AWS = require("aws-sdk");

AWS.config.getCredentials(function(err: { stack: any; }) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});