    const mongoose = require("mongoose");

    const DocumentSchema = new mongoose.Schema({
    _id: String,
    data: Object,
    owner: String, 
    isEditable: Boolean
    });

    module.exports = mongoose.model("Document", DocumentSchema);
