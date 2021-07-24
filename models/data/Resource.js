const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  available: {
    type: Boolean,
    default: true,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
});
const Resource = mongoose.model("Resource", schema, "resources");
module.exports = Resource;
