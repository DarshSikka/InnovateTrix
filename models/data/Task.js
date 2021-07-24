const mongoose = require("mongoose");
const schema = {
  from: {
    type: String,
    required: true,
  },
  to: {
    type: Array,
    required: true,
  },
  receiverAddress: {
    type: String,
    required: true,
  },
  resourceId: {
    type: String,
    required: true,
  },
  assigned: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: String,
    default: "",
  },
};
const mongoSchema = new mongoose.Schema(schema);
const Task = mongoose.model("Task", mongoSchema, "tasks");
module.exports = Task;
