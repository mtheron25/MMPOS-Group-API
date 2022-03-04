require("dotenv").config;
const express = require("express");
const Users = require("../models/users");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  getUser,
  getProduct
} = require("../middleware/finders");

const app = express.Router();

// GET all users
app.get("/", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json({
      message: "SUCCESS",
      results: users
    });
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

// GET one user
app.get("/single-user/", auth, async(req, res, next) => {
  try {
    const user = await Users.findById(req.user._id)
  res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN user with email + password
app.patch("/", async (req, res, next) => {
  const {
    email,
    password
  } = req.body;
  const user = await Users.findOne({
    email
  });

  if (!user) res.status(404).json({
    message: "Could not find user"
  });
  if (await bcrypt.compare(password, user.password)) {
    try {
      const access_token = jwt.sign(
        JSON.stringify(user),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(201).json({
        jwt: access_token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  } else {
    res
      .status(400)
      .json({
        message: "Email and password combination do not match"
      });
  }
});

// REGISTER a user
app.post("/", async (req, res, next) => {
  const {
    fullname,
    email,
    password,
    contact
  } = req.body;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new Users({
    fullname,
    email,
    password: hashedPassword,
    contact
  });

  try {
    const newUser = await user.save();

    try {
      const access_token = jwt.sign(
        JSON.stringify(newUser),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(201).json({
        jwt: access_token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// UPDATE a user
app.put("/",auth, async (req, res, next) => {
  const user = await Users.findById(req.user._id)
  const {
    fullname,
    contact,
    password
  } = req.body;
  if (fullname) user.fullname = fullname;
  if (contact) user.contact = contact;
  if (password) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
  }
  try {
    const updatedUser = await user.save();

    try {
      const token = jwt.sign(
        JSON.stringify(updatedUser),
        process.env.ACCESS_TOKEN_SECRET
      );
      res.status(201).json({ jwt: token, user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    // Dont just send user as object, create a JWT and send that too.
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a user
app.delete("/:id", getUser, async (req, res, next) => {
  try {
    const user = await Users.findById(req.user._id)
    await user.remove();
    res.json({ message: "Deleted user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//CART
// Get all products in the cart
app.get('/cart', auth, async (req, res, next) => {
  try {
    const user = await Users.findById(req.user._id)
  res.status(201).json(user.cart)
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
})

//Add product to cart
app.post('/:id/cart', [auth, getProduct], async (req, res, next) => {
  const user = await Users.findById(req.user._id)
  let product_id = res.product._id
  let title = res.product.title
  let category = res.product.category
  let description = res.product.description
  let price = res.product.price
  let img = res.product.img
  let qty = req.body.qty
  let created_by = req.user._id

  console.log({
    product_id,
    title,
    category,
    description,
    img,
    created_by,
    qty,
    price
  })
  try {
    user.cart.push({
      product_id,
      title,
      category,
      description,
      price,
      img,
      created_by,
      qty
    })
    const updatedUser = await user.save();
    res.status(201).json(updatedUser)
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
})

//Update cart

app.put("/:id/cart", [auth, getProduct], async (req, res, next) => {
  const user = await Users.findById(req.user._id);
  const inCart = user.cart.some((prod) => prod.product_id == req.params.id);
  console.log(inCart)

  if (inCart) {
    try {
    const product = user.cart.find((prod) => prod.product_id == req.params.id)
    product.qty = req.body.qty;
    user.cart.qty = product.qty;
    user.markModified("cart")
    const updatedUser = await user.save();
   
      res.status(201).json(updatedUser.cart);
    } catch (error) {
      res.status(500).json(console.log(error));
    }
  }
});
//Clear cart
app.delete('/:id/cart', [auth, getUser], (req, res, next) => {
res.send(Users);
})


module.exports = app;