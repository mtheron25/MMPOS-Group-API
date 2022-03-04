const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  product_id: {
    type: String
  },
  title: {
    type: String,
    required: true,
  },
    category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: false,
    default: "placeholder image"
  },
  price: {
    type: Number
  },
  created_by: {
    type: String
  }
});

module.exports = mongoose.model("Products", productSchema);