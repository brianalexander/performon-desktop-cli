const dns = require("dns");
const os = require("os");

const { writeJSONToDisk } = require("./fileSystem");

function isValidUUID(uuid) {
  if (!uuid) {
    throw new Error(
      "Invalid UUID.  Please generate a new UUID using the -g option."
    );
  }

  return true;
}

function isValidPort(port) {
  if (port < 0 || port > 100000 || !Number.isInteger(port)) {
    throw new Error(
      "Invalid port number.  Please choose an integer between..."
    );
  }

  return true;
}

function isValidUploadRate(uploadRateSeconds) {
  if (uploadRateSeconds < 1 || !Number.isInteger(uploadRateSeconds)) {
    throw new Error(
      "Invalid upload rate.  Please choose an integer greater than or equal to 1."
    );
  }

  return true;
}

function isValidConfig(config) {
  const { uuid, port, uploadRateSeconds } = config;
  isValidUUID(uuid);
  isValidPort(port);
  isValidUploadRate(uploadRateSeconds);
}

function statusOK(status) {
  return status >= 200 && status < 300;
}

function createConf(configPath, options) {
  writeJSONToDisk(configPath, options);
  return options;
}

function canReachServer() {
  return new Promise(resolve => {
    dns.resolve("www.google.com", (err, records) => {
      if (err) {
        throw new Error(
          "Unable to connect to the server.  Please check your internet connection."
        );
      }
      resolve(!!records);
    });
  });
}

function cpuAverage() {
  const cpus = os.cpus();

  // get milliseconds (ms), but # is since reboot, so get it now
  // and compare it in 100ms
  let idleMs = 0;
  let totalMs = 0;

  // for each core
  for (let core of cpus) {
    // loop through each property of the current core
    idleMs += core.times.idle;
    for (let type in core.times) {
      totalMs += core.times[type];
    }
  }

  // returns average idle & total time across all cores
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length
  };
}

function getCpuLoad() {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    const start = cpuAverage();

    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;
      const percentageUsage = Math.ceil(
        100 - (100 * idleDifference) / totalDifference
      );

      resolve(percentageUsage);
    }, 1000);
  });
}

module.exports = {
  getCpuLoad,
  canReachServer,
  createConf,
  statusOK,
  isValidConfig,
  isValidUUID
};
