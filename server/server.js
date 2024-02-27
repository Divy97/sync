const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {
  //   console.log("Connected", count++);
  socket.on("send-changes", (delta) => {
    socket.broadcast.emit("receive-changes", delta);
  });
});
