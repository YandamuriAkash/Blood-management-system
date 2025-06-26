// models/Donor.js

const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  name: String,
  bloodGroup: String,
  location: String,
  email: { type: String, unique: true },
  mobile: { type: String, unique: true }
});

module.exports = mongoose.model("Donor", donorSchema);
