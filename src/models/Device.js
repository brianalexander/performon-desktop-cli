const si = require("systeminformation");
const objectHash = require("object-hash");

const { getCpuLoad } = require("../util/utils");

class Device {
  constructor(options) {
    this._hash = options.hash;
    this._osType = options.osType;
    this._cpuModel = options.cpuModel;
    this._numLogicalCores = options.numLogicalCores;
    this._cpuSpeed = options.cpuSpeed;
    this._totalMem = options.totalMem;
    this._networkInterface = options.networkInterface;
  }

  get hash() {
    return this._hash;
  }

  get specs() {
    return {
      osType: this._osType,
      cpuModel: this._cpuModel,
      cpuSpeed: this._cpuSpeed,
      numLogicalCores: this._numLogicalCores,
      totalMem: this._totalMem
    };
  }

  async getCurrentMetrics() {
    const mem = await si.mem();
    const temps = await si.cpuTemperature();
    let [networkStats] = await si.networkStats(this.interface);

    const memUsage = Math.round((mem.used / mem.total) * 100);
    const upTime = si.time().uptime;
    const cpuLoad = await getCpuLoad();
    const cpuTemp = temps.main;

    if (networkStats.rx_sec === -1) {
      [networkStats] = await si.networkStats(this.interface);
    }

    const sentBytes = networkStats.tx_sec;
    const recievedBytes = networkStats.rx_sec;

    return { memUsage, upTime, cpuLoad, cpuTemp, sentBytes, recievedBytes };
  }

  static async Build() {
    const osInfo = await si.osInfo();
    const mem = await si.mem();
    const baseboard = await si.baseboard();
    const cpu = await si.cpu();
    const graphics = await si.graphics();
    const networkInterfaces = await si.networkInterfaces();

    let macAddress;
    let networkInterface;

    for (let i = 0; i < networkInterfaces.length; i++) {
      if (!networkInterfaces[i].internal) {
        macAddress = networkInterfaces[i].mac;
        networkInterface = networkInterfaces[i].iface;
        break;
      }
    }

    // Use substring of totalmem to avoid small fluctuations in total memory
    const hashData = {
      macAddress: macAddress,
      cpu: { cores: cpu.cores, speed: cpu.speed },
      mem: {
        totalMem: String(mem.total).substr(0, 3)
      },
      motherboard: {
        manufacturer: baseboard.manufacturer,
        model: baseboard.model
      },
      graphics: {
        vendor: graphics.controllers[0].vendor,
        model: graphics.controllers[0].model
      }
    };

    const hash = objectHash(hashData);
    const osType = [osInfo.distro, osInfo.release, osInfo.arch].join(" ");
    const cpuModel = cpu.manufacturer + " " + cpu.brand;
    const numLogicalCores = cpu.cores;
    const cpuSpeed = cpu.speed;
    const totalMem = mem.total / 1024.0;

    return new Device({
      hash,
      osType,
      cpuModel,
      numLogicalCores,
      cpuSpeed,
      totalMem,
      networkInterface
    });
  }
}

module.exports = Device;
