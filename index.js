var awsIot = require('aws-iot-device-sdk');
var deviceName = "ci-illuminate";

var translate = {
  fixed: "success",
  successful: "success",
  failed: "failure",
  error: "failure"
}

exports.handler = function (event, context, callback) {
  // Validate event
  if (!event.name) {
    handleError(new Error("Project name expected"));
    return;
  }

  if (!event.build || !event.build.status) {
    handleError(new Error("Build status expected"));
    return;
  }

  var projectName = event.name;
  var projectStatus = event.build.status.toLowerCase();
  projectStatus = translate[projectStatus] || projectStatus;

  var device = awsIot.device({
    keyPath: './private.pem.key',
    certPath: './certificate.pem.crt',
    caPath: './root-CA.pem.crt',
    clientId: deviceName,
    host: 'XXXXXXXXXXXXX.iot.us-east-1.amazonaws.com',
    region: "eu-east-1",
  });

  device.on('connect', function() {
    console.log("connected");
    device.publish('project:'+projectName, JSON.stringify({
      project: projectName,
      status: projectStatus
    }), {}, function(err) {
      device.end();
      if (err) {
        handleError(err);
      } else {
        callback(err, {
          status: "OK"
        });
      }
    });
  });

  device.on('error', function(err) {
    handleError(err);
  });
};

function handleError(err, callback) {
  callback(err, {
    status: "Error",
    message: err.message
  });
}
