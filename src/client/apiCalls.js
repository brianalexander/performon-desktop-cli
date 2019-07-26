const axios = require("axios");
const { statusOK } = require("../util/utils");

const baseURL = "http://localhost:9090/v1/";

async function registerDevice(payload) {
  console.log("Registering the device...");

  const putResponse = await axios({
    url: `/devices/${payload.deviceHash}`,
    baseURL: baseURL,
    method: "put",
    data: payload,
    validateStatus: function(status) {
      return status < 500;
    }
  });
  if (!statusOK(putResponse.status)) {
    // if the device doesn't exist, create the device
    const postResponse = await axios({
      url: `/devices`,
      baseURL: baseURL,
      method: "post",
      data: payload,
      validateStatus: function(status) {
        return status < 500;
      }
    });
    // If the user failed to be created, return false
    if (!statusOK(postResponse.status)) {
      throw new Error(
        `Failed to register the device, with HTTP status code ${
          postResponse.status
        }`
      );
    }
  }
}

async function createUser(payload = {}) {
  console.log("Creating a new user...");

  const response = await axios({
    url: `/users`,
    baseURL: baseURL,
    method: "post",
    data: payload, // No data to send yet... just get id
    validateStatus: function(status) {
      return status < 500;
    }
  });

  if (!statusOK(response.status)) {
    throw new Error(
      `Failed to create the user, with HTTP status code ${response.status}`
    );
  }

  return response;
}

async function verifyUserExists(payload) {
  console.log(`Verifying user has been created...`);

  const response = await axios({
    url: `/users/${payload.uuid}`,
    baseURL: baseURL,
    method: "get",
    data: {},
    validateStatus: function(status) {
      return status < 500;
    }
  });

  if (!statusOK(response.status)) {
    throw new Error(
      `Failed to find the user, with HTTP status code ${response.status}`
    );
  }

  return response;
}

module.exports = {
  registerDevice,
  verifyUserExists,
  createUser
};
