const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});
const Token = mongoose.model("Token", schema, "");
module.exports = Token;
