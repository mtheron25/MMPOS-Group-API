require("dotenv").config;
const express = require("express");
const products = require("../models/products");
const auth = require("../middleware/auth");
const { getProduct } = require("../middleware/finders");
const app = express.Router();

// GET all products
app.get("/", auth, async (req, res) => {
  try {
    const product = await products.find();
    res.status(201).send(product);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// GET one product
app.get("/:id", [auth, getProduct], (req, res, next) => {
  res.send(res.product);
});

// CREATE a product
app.post("/", auth, async (req, res, next) => {
  const {title, category, description, img, price } = req.body;
  let product;
  img
    ? (product = new products({
      title, 
      category, 
      description, 
      img, 
      created_by: req.user._id,
      price
      
      }))
    : (product = new products({
      title,
      category,
      description,  
      img,
      price,
      created_by: req.user._id,
      price
      }));

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a product
app.put("/:id", [auth, getProduct], async (req, res, next) => {
    res
      .status(400)
      .json({ message: "You do not have the permission to update this product" });
  const { title, category, description, img, price} = req.body;
  if (title) res.product.title = title;
  if (category) res.product.category = category;
  if (description) res.product.description = description;
  if (price) res.product.price = price;
  if (img) res.product.img = img;
  try {
    const updatedProduct = await res.product.save();
    res.status(201).send(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a product
app.delete("/:id", [auth, getProduct], async (req, res, next) => {
  if (req.user._id !== req.product.created_by)
    res
      .status(400)
      .json({ message: "You do not have the permission to delete this product" });
  try {
    await res.product.remove();
    res.status(201).json({ message: "Deleted product" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = app;
