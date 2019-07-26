const fs = require("fs");

function writeJSONToDisk(path, jsonOptions) {
  fs.writeFileSync(path, JSON.stringify(jsonOptions, null, 2));
}

function readJSONFromDisk(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (err) {
    throw new Error(
      `${path} does not exist or the data is corrupted.  Please check that the file exists and is valid JSON.`
    );
  }
}

module.exports = {
  writeJSONToDisk,
  readJSONFromDisk
};
