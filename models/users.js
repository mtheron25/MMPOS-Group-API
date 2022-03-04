const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: {
    type: String
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  join_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  cart: {
    type: Array,
    required: false,
    default: []
  }
});

module.exports = mongoose.model("Users", userSchema);