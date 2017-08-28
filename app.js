// ConnectionString for the iothub on service management level (not the device connection string)
var connectionString = process.env.iothubconnectionstring;
var delayMin = 0; //seconds
var delayMax = 1; //seconds
var delayDiff = delayMax - delayMin;
var offlineMin = 0; // min skip # iterations 
var offlineMax = 10; // max skip & iterations
var offlineDiff = offlineMax - offlineMin;
var interval = 15; //seconds
var sendInterval = interval * 1000;

// Load Libraries
var iothub = require('azure-iothub');
const uuidv4 = require('uuid/v4');
var InfiniteLoop = require('infinite-loop');
var dateFormat = require('dateformat');

// Dirty hack for a "sleep"
function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

// Register Device (random GUID as name)
var registry = iothub.Registry.fromConnectionString(connectionString);
var device = {
  deviceId: uuidv4()
}
registry.create(device, function(err, deviceInfo, res) {
  if (err) {
    console.log(err);
    registry.get(device.deviceId, printDeviceInfo);

  }
  if (deviceInfo) {
    startConnectedVehicle(err, deviceInfo, res);
  }
});

// Start sending messages
var clientFromConnectionString = require('azure-iot-device-http').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

function startConnectedVehicle(err, deviceInfo, res) {
  var connectionString = "HostName=iothubHost;DeviceId=deviceId;SharedAccessKey=deviceKey";
  var connectionString = connectionString.replace("deviceId", deviceInfo.deviceId);
  var connectionString = connectionString.replace("deviceKey", deviceInfo.authentication.symmetricKey.primaryKey);
  var connectionString = connectionString.replace("iothubHost", registry._config.host);
  var client = clientFromConnectionString(connectionString);
  console.log("Device Connection String : " + connectionString);
  var il = new InfiniteLoop();
  il.add(generateMessages, err, client, res).run();
}

// Overall helper to generate messages
function generateMessages(err, client, res) {
  var iterations = offlineMin + (Math.random() * offlineDiff);
  console.log(iterations);
  var data = [];
  for (i = 0; i < iterations; i++) {
    var speed = 0 + (Math.random() * 90); // range: [0, 90]
    var temperature = 15 + (Math.random() * 20); // range: [15, 35]
    var humidity = 40 + (Math.random() * 30); // range: [40, 70]
    var now = new Date();
    data.push({id: uuidv4(), date: dateFormat(now, "isoDateTime"), message: 'test', speed: speed, temperature: temperature, humidity: humidity});
    console.log("Sleep for: " + interval + "s");
    wait(sendInterval);
  }
  console.log(data);
  sendBatchMessages(err, client, data, res);
}

// Send all messages in batch after one "offline" iteration
function sendBatchMessages(err, client, data, res) {
  var messages = [];
  data.forEach(function (value) {
    messages.push(new Message(JSON.stringify(value)));
  });
  console.log('sending ' + messages.length + ' events in a batch');
  client.sendEventBatch(messages, printResultFor('send'));
}

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}
