const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
 _id: String,
 data: Object,
 owner: String, // Store the username of the document's owner
});

module.exports = mongoose.model("Document", DocumentSchema);
