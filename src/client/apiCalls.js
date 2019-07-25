const axios = require("axios");
const { statusOK } = require("../util/utils");

const baseURL = "http://localhost:9090/v1/";

async function registerDevice(payload) {
  console.log("register device");
  try {
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
        console.log(postResponse);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function registerUser(payload) {
  console.log("making requests");
  try {
    const putResponse = await updateUser(payload);
    if (!statusOK(putResponse.status)) {
      // if the user doesn't exist, create the user
      const postResponse = await createUser({});
      // If the user failed to be created, return false
      if (!statusOK(postResponse.status)) {
        console.log(postResponse);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function createUser(payload) {
  try {
    const response = await axios({
      url: `/users`,
      baseURL: baseURL,
      method: "post",
      data: payload, // No data to send yet... just get id
      validateStatus: function(status) {
        return status < 500;
      }
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}

async function updateUser(payload) {
  try {
    const response = await axios({
      url: `/users/${payload.userUUID}`,
      baseURL: baseURL,
      method: "put",
      data: { payload },
      validateStatus: function(status) {
        return status < 500;
      }
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  registerDevice,
  registerUser,
  createUser
};
