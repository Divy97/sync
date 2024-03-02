const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Document = require("./Document");

const app = express();
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
     origin: "http://localhost:5173",
     methods: ["GET", "POST"],
  },
 });
 
 mongoose.connect("mongodb+srv://divyparekh1810:divyparekh1810@cluster0.3hrodsw.mongodb.net/documents", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 });

io.on("connection", (socket) => {
 socket.on("get-document", async (documentId, username) => {
    let document = await Document.findById(documentId);
    if (!document) {
      document = await Document.create({ _id: documentId, data: {}, owner: username });
    }
    socket.join(documentId);
    socket.emit("load-document", {data: document.data, owner: document.owner});

    socket.on("send-changes", async (delta, username) => {
      // console.log(document.owner, username);
      
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      
    });

    socket.on("save-document", async (data, username) => {
      if (document.owner === username) {
        await Document.findByIdAndUpdate(documentId, { data });
      }
    });
 });
});

server.listen(3001, () => {
 console.log("Server running on port 3001");
});
