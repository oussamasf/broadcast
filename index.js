const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { EventEmitter } = require("events");
const pm2 = require("pm2");

const eventEmitter = new EventEmitter();
const channel = "myChannel";

// Listen for the custom event and broadcast it
eventEmitter.on(channel, (data) => {
  console.log("Event triggered:", data);
  io.emit(channel, data);
});

// Start the PM2 buss
pm2.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  pm2.launchBus((errLb, bus) => {
    if (errLb) {
      console.error(errLb);
      process.exit(1);
    }

    bus.on(channel, (data) => {
      console.log("Event received:", data);
      eventEmitter.emit(channel, data);
    });
  });
});

// Add a sample route that emits the event
app.get("/", (req, res) => {
  const data = { message: "Hello World!" };
  eventEmitter.emit(channel, data);
  res.send("Event emitted!");
});

// Start the server
server.listen(8346, () => {
  console.log("Server started on port 3000");
});
