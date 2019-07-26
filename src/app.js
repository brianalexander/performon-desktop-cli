//
// Main
//
module.exports = async function main(uuid, port, uploadRateSeconds) {
  //
  // Imports
  //
  const Device = require("./models/Device");
  const { registerDevice } = require("./client/apiCalls");
  const sendData = require("./client/udpClient")(port);

  // Get Device
  try {
    const device = await Device.Build();

    // Create or Update Device
    await registerDevice({
      userUUID: uuid,
      hash: device.hash,
      ...device.specs
    });

    // Begin Uploading
    // eslint-disable-next-line no-unused-vars
    const uploadInterval = setInterval(async () => {
      const metrics = await device.getCurrentMetrics();
      console.log(metrics);
      sendData("metrics", {
        userUUID: uuid,
        deviceHash: device.hash,
        metrics
      });
    }, uploadRateSeconds * 1000);
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
};
