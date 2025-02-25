const express = require("express");
const Product = require("./product.model");
const jwt = require("jsonwebtoken");
const User = require("../auth/auth.model");
const Trash = require("../TrashProducts/trash.model");

const app = express.Router();

app.get("", async (req, res) => {
  const { limit, page, category, q, sort, arr, off, offSet, firstLetter } =
    req.query;
  try {
    if (category && q) {
      let temp = new RegExp(q, "i");
      let products = await Product.find({
        category: category,
        name: temp,
      }).limit(limit);
      console.log(products);
      return res.send(products);
    } else if (category && sort) {
      if (sort == "asc") {
        let temp = await Product.find({ category: category })
          .sort({ price1: 1 })
          .limit(limit);
        return res.send(temp);
      } else if (sort == "desc") {
        let temp = await Product.find({ category: category })
          .sort({ price1: -1 })
          .limit(limit);
        return res.send(temp);
      }
    } else if (category && firstLetter) {
      const temp = firstLetter;
      let products = await Product.find({
        category: category,
        name: { $regex: "^" + temp, $options: "i" },
      }).limit(limit);
      return res.send(products);
    } else if (category && arr) {
      const [min, max] = arr.split(",").map(Number);
      let temp = await Product.find({
        category: category,
        $and: [{ price1: { $gte: min } }, { price1: { $lt: max } }],
      })
        .sort({ price1: 1 })
        .limit(limit);
      return res.send(temp);
    } else if (category && off) {
      const [min, max] = off.split(",").map(Number);
      let temp = await Product.find({
        category: category,
        $and: [{ off: { $gte: min } }, { off: { $lt: max } }],
      })
        .sort({ off: 1 })
        .limit(limit);
      return res.send(temp);
    } else if (category && offSet) {
      if (offSet == "asc") {
        let temp = await Product.find({ category: category })
          .sort({ off: 1 })
          .limit(limit);
        return res.send(temp);
      } else if (offSet == "desc") {
        let temp = await Product.find({ category: category })
          .sort({ off: -1 })
          .limit(limit);
        return res.send(temp);
      }
    } else if (category) {
      let products = await Product.find({ category: category })
        .skip((page - 1) * limit)
        .limit(20);
      return res.send(products);
    } else if (input) {
      let temp = new RegExp(input, "i");
      let products = await Product.find({ name: temp })
        .skip((page - 1) * limit)
        .limit(20);
      return res.send(products);
    }
    let products = await Product.find()
      .skip((page - 1) * limit)
      .limit(20);
    return res.send(products);
  } catch (e) {
    return res.send(e.mesasge);
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let product = await Product.findById({ _id: id });
    return res.send(product);
  } catch (e) {
    return res.send(e.message);
  }
});

app.patch("/:id", async (req, res) => {
  let token = req.headers.token;
  const { title, stars, type } = req.body;
  console.log({ stars });
  const { id } = req.params;
  try {
    let decode = jwt.decode(token, "17147714");
    if (!decode) {
      return res.send("Invalid token");
    } else {
      let user = await User.findById({ _id: decode._id });
      if (!user) {
        return res.send("User not found");
      } else {
        if (!type) {
          return res.send("type is missing");
        } else if (type == "rating") {
          let product = await Product.findByIdAndUpdate(
            { _id: id },
            {
              $push: {
                ratings: {
                  user_name: user?.name,
                  user_image: user?.user_image,
                  stars: stars,
                },
              },
            }
          );
          return res.send(product);
        } else if (type == "review") {
          let product = await Product.findByIdAndUpdate(
            { _id: id },
            {
              $push: {
                reviews: {
                  user_name: user?.name,
                  user_image: user?.user_image,
                  title: title,
                },
              },
            }
          );
          return res.send(product);
        }
      }
    }
  } catch (e) {
    return res.send(e.message);
  }
});

app.patch("", async (req, res) => {
  const {
    id,
    price1,
    price2,
    off,
    qunatity,
    category,
    tablet,
    ingredients,
    company,
    testInclude,
    name,
    image,
  } = req.body;
  const token = req.headers.token;

  try {
    let decode = jwt.decode(token, "17147714");
    if (!decode) {
      return res.send("Invalid token");
    } else {
      let product = await Product.findByIdAndUpdate(
        { _id: id },
        {
          price1,
          price2,
          off,
          qunatity,
          category,
          tablet,
          ingredients,
          company,
          testInclude,
          name,
          image,
        }
      );
      return res.send(product);
    }
  } catch (e) {
    return res.send(e.message);
  }
});

app.delete("/:id", async (req, res) => {
  const token = req.headers.token;
  const {
    price1,
    price2,
    off,
    qunatity,
    category,
    tablet,
    ingredients,
    company,
    testInclude,
    name,
    image,
  } = req.body;
  try {
    let decode = jwt.decode(token, "17147714");
    if (!decode) {
      return res.send("Invalid token");
    } else {
      let trash = await Trash.create(req.body);
      let product = await Product.findByIdAndDelete(req.params.id);
      res.send(trash);
    }
  } catch (e) {
    return res.send(e.message);
  }
});

module.exports = app;
