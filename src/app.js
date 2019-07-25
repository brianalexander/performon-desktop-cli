//
// Imports
//
const Device = require("./models/Device");
const { readJSONFromDisk } = require("./util/fileSystem");
const { createConf, canReachServer } = require("./util/utils");
const { sendData } = require("./client/udpClient");
const {
  createUser,
  registerDevice,
  registerUser
} = require("./client/apiCalls");

//
// Consts
//
const configPath = "performon.conf";
const uploadRateMs = 1000;

//
// Main
//
module.exports = async function main() {
  // check for performon.conf in same directory
  // if exists, read in data and start
  // if !exists, generate default, use new data and start
  let config = readJSONFromDisk(configPath);
  if (config === null) {
    const response = await createUser({});
    // eslint-disable-next-line require-atomic-updates
    config = createConf(configPath, {
      uuid: response.data.user.uuid,
      uploadRateMs: uploadRateMs
    });
  }

  // Verify Internet Connectivity
  const online = await canReachServer();
  if (!online) {
    console.log("You are not connected to the internet.");
    process.exit();
  }

  // Get Device
  const device = await Device.Build();
  console.log({ userUUID: config.uuid, hash: device.hash, ...device.specs });

  // RegisterDevice
  const success =
    (await registerUser({ uuid: config.uuid })) &&
    (await registerDevice({
      userUUID: config.uuid,
      hash: device.hash,
      ...device.specs
    }));
  if (!success) {
    console.log("Failed to register device.");
    process.exit();
  }

  // Begin Uploading
  // eslint-disable-next-line no-unused-vars
  const uploadInterval = setInterval(async () => {
    const metrics = await device.getCurrentMetrics();
    console.log(metrics);
    sendData("metrics", {
      userUUID: config.uuid,
      deviceHash: device.hash,
      metrics
    });
  }, uploadRateMs);
};
