const mongoose = require("mongoose");
const schema = {
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
};
const fitSchema = new mongoose.Schema(schema);
const Voulunteer = mongoose.model("Voulunteer", schema, "voulunteers");
module.exports = Voulunteer;
