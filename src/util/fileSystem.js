const fs = require("fs");

function writeJSONToDisk(path, jsonOptions) {
  fs.writeFileSync(path, JSON.stringify(jsonOptions, null, 2));
}

function readJSONFromDisk(path) {
  // eslint-disable-next-line no-useless-catch
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (err) {
    return null;
  }
}

module.exports = {
  writeJSONToDisk,
  readJSONFromDisk
};
