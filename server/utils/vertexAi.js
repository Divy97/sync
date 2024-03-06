const { VertexAI } = require('@google-cloud/vertexai');

const projectId = "para-generation";
const location = "us-central1";
const model = "gemini-1.0-pro-vision";

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


module.exports = createNonStreamingMultipartContent;