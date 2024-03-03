const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const bodyParser = require('body-parser');
const { VertexAI } = require('@google-cloud/vertexai');
const Document = require("./Document");
const cors = require('cors')

const app = express();
const server = require("http").createServer(app);
const io = new Server(server, {
 cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
 },
});

app.use(cors())
app.use(bodyParser.json());

mongoose.connect(
 "mongodb+srv://divyparekh1810:divyparekh1810@cluster0.3hrodsw.mongodb.net/documents",
 {
    useNewUrlParser: true,
    useUnifiedTopology: true,
 }
);

io.on("connection", (socket) => {
 socket.on("get-document", async (documentId, username, isEditable) => {
    let document = await Document.findById(documentId);
    if (!document) {
      document = await Document.create({
        _id: documentId,
        data: {},
        owner: username,
        isEditable: isEditable
      });
    }
    socket.join(documentId);
    socket.emit("load-document", {
      data: document.data,
      owner: document.owner,
      isEditable: document.isEditable
    });

    socket.on("send-changes", async (delta, username) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data, username) => {
      if (document.owner === username) {
        await Document.findByIdAndUpdate(documentId, { data });
      }
    });

    socket.on('send-generated-text', (generatedText, username) => {
      socket.broadcast.to(documentId).emit('receive-generated-text', generatedText);
    });
 });
});

const projectId = 'para-generation';
const location = 'us-central1';
const model = 'gemini-1.0-pro-vision';

async function createNonStreamingMultipartContent(text) {
 const vertexAI = new VertexAI({ project: projectId, location: location });
 const generativeVisionModel = vertexAI.getGenerativeModel({ model: model });

 const textPart = {
    text: text
 };

 const request = {
    contents: [{ role: "user", parts: [textPart] }],
 };

 console.log("Prompt Text:");
 console.log(request.contents[0].parts[0].text);

 console.log("Non-Streaming Response Text:");
 const responseStream = await generativeVisionModel.generateContentStream(request);

 const aggregatedResponse = await responseStream.response;

 const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text || "Sorry, I couldn't generate a response.";

 return fullTextResponse; 
}

app.post('/generate-text', async (req, res) => {
 try {
    const { text } = req.body;
    const response = await createNonStreamingMultipartContent(text);
    res.status(200).json({status: "success", response: response }); 
 } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
 }
});

server.listen(3001, () => {
 console.log("Server running on port 3001");
});
