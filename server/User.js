const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  username: {
    type: String,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
});

module.exports = model("User", UserSchema);
