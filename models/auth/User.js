//import mongoose for usage
const mongoose = require("mongoose");

//Define the schema for the users collection
const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

//make the model out of the Schema
//Pass the name as user
//Pass the schema as the const schema
//Pass the collection as users
const User = mongoose.model("User", schema, "users");

//Export the User model for use in the main file
module.exports = User;
