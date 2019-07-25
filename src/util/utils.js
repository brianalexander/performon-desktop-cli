const dns = require("dns");
const os = require("os");
const util = require("util");

const { writeJSONToDisk } = require("./fileSystem");

function statusOK(status) {
  return status >= 200 && status < 300;
}

function createConf(configPath, options) {
  writeJSONToDisk(configPath, options);
  return options;
}

async function canReachServer() {
  const dnsResolve = util.promisify(dns.resolve);
  try {
    const addr = await dnsResolve("www.google.com");
    return !!addr;
  } catch (err) {
    console.log(err);
    return false;
  }
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
  statusOK
};
