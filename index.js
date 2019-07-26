const app = require("./src/app");

const {
  createConf,
  isValidUUID,
  isValidConfig,
  canReachServer
} = require("./src/util/utils");
const { readJSONFromDisk } = require("./src/util/fileSystem");

const { createUser, verifyUserExists } = require("./src/client/apiCalls");

const numArgs = process.argv.length - 2;
const argv = process.argv.slice(2);
const defaultConfig = { uuid: "", port: 41234, uploadRateSeconds: 1 };

async function startApp(numArgs, argv) {
  if (numArgs === 0) {
    // start using current config file at default location
    const config = readJSONFromDisk("performon.conf");
    await startAppFromConfig(config);
  } else if (numArgs === 1) {
    console.log("1 arg");
    if (argv[0] === "-h") {
      showUsageInformation();
    } else if (argv[0] === "-p") {
      console.log(readJSONFromDisk("performon.conf"));
      process.exit(0);
    } else if (argv[0] === "-g") {
      // register new UUID with server and store it in conf file with default values
      const { uuid } = await createUser();
      console.log(`New user registered with uuid ${uuid}`);
      const config = { ...defaultConfig, uuid: uuid };
      const defaultPath = "performon.conf";
      createConf("performon.conf", config);
      console.log(`Config file generated at ./${defaultPath}.`);
      console.log(
        "Thanks for using Performon!  Please run again with no arguments to start using the new configuration."
      );
      process.exit(0);
    } else if (isValidUUID(argv[0])) {
      console.log("valid uuid");
      const config = { ...defaultConfig, uuid: argv[0] };
      await startAppFromConfig(config);
    } else {
      // start app with config @ argv[0]
    }
  } else if (numArgs === 2) {
    const config = {
      ...defaultConfig,
      uuid: argv[0],
      port: Number(argv[1])
    };
    await startAppFromConfig(config);
  } else if (numArgs === 3) {
    const config = {
      uuid: argv[0],
      port: Number(argv[1]),
      uploadRateSeconds: Number(argv[2])
    };
    await startAppFromConfig(config);
  } else {
    // If none of the above...
    showUsageInformation();
  }
}

function showUsageInformation() {
  // TODO: output usage
  console.log("usage information");
}

async function startAppFromConfig(config) {
  try {
    isValidConfig(config);
    await canReachServer();
    console.log("after calblack");
    await verifyUserExists({ uuid: config.uuid });
    await app(config.uuid, config.port, config.uploadRateSeconds);
  } catch (err) {
    console.log(err.message);
    process.exit();
  }
}

//
// START THE APP!
//
try {
  startApp(numArgs, argv);
} catch (err) {
  console.log(err.message);
  process.exit();
}
