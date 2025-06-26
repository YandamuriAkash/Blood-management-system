// models/Request.js

const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  bloodGroup: String,
  location: String,
  email: String,
  mobile: String
});

module.exports = mongoose.model("Request", requestSchema);
