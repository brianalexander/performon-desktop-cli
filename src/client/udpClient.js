const dgram = require("dgram");

const host = "localhost";
const port = 41234;

// Create udp server socket object.
const client = dgram.createSocket("udp4");

async function sendData(contentType, payload) {
  const msg = Buffer.from(
    JSON.stringify({
      contentType: contentType,
      payload: payload
    })
  );

  client.send(msg, port, host, err => {
    if (err) {
      console.log(err);
      client.close();
    }
  });
}

module.exports = {
  sendData
};
