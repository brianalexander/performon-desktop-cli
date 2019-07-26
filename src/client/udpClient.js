const dgram = require("dgram");

module.exports = function(port) {
  const host = "localhost";
  const client = dgram.createSocket("udp4");

  return function sendData(contentType, payload) {
    const msg = Buffer.from(
      JSON.stringify({
        contentType: contentType,
        payload: payload
      })
    );

    console.log(`Uploading data on port ${port}...`);
    client.send(msg, port, host, err => {
      if (err) {
        // client.close();
        console.log(err.message);
      }
    });
  };
};
