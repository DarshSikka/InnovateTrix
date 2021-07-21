const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  to: {
    type: Object,
    required: true,
  },
  from: {
    type: Object,
    required: true,
  },
});
const Mailbox = mongoose.model("Mailbox", schema, "mails");
module.exports = Mailbox;
