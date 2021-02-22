var should = require("should");
var io = require("socket.io-client");

var socketURL = "http://localhost:5000/";

describe("Chat Server", function () {
  var server,
    options = {
      transports: ["websocket"],
      "force new connection": true,
    };
  beforeEach(function (done) {
    // start the server
    server = require("../../server/index").server;
    done();
  });
  it("echos message", function (done) {
    var client = io.connect("http://localhost:3000", options);
    client.once("join", function () {
      console.log("test");
      client.once("message", function (message) {
        message.should.equal("Hello World");
        client.disconnect();
        done();
      });
      client.emit("message", "Hello World");
    });
  });
});
