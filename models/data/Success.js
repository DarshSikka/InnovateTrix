const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  doneBy: {
    type: String,
    required: true,
  },
  donatedBy: {
    type: String,
    required: true,
  },
});
const Success = mongoose.model("Success", schema, "completed");
module.exports = Success;
