import express from "express";
import Product from "../services/mongodb/models/Product";
import { body, validationResult } from "express-validator";
import Category from "../services/mongodb/models/Category";

const router = express.Router();

/*
type : GET
path : /api/v1/product/all
params : none
isProtected: false (public)
*/

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    return res
      .status(200)
      .json({ products, message: "Successfully fetched products" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ products: [], message: "error fetching products" });
  }
});

/*
type : GET
path : /api/v1/product/all
params : none
query: categoryId
isProtected: false (public)
*/

router.get("/all", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const products = await Product.find({ category: categoryId }).populate(
      "category"
    );
    return res
      .status(200)
      .json({ products, message: "Successfully fetched products" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ products: [], message: "error fetching products" });
  }
});

/*
type : POST
path : /api/v1/product/add
params : none
isProtected: true (admin)
*/

router.post(
  "/add",
  body("name").isLength({ min: 1 }),
  body("price").isNumeric(),
  body("listPrice").isNumeric(),
  body("stock").isNumeric(),
  body("description").isLength({ min: 10 }),
  body("color").isLength({ min: 1 }),
  body("category").isLength({ min: 5 }),
  async (req, res) => {
    const { errors } = validationResult(req);
    if (errors.length > 0)
      return res
        .status(403)
        .json({ errors, message: "Bad request, validation failed" });

    try {
      // check if the category is valid/exists
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(300).json({
          product: null,
          message: "Invalid category",
        });

      const product = new Product(req.body);
      await product.save();
      res.status(200).json({
        success: true,
        data: {
          product,
        },
        message: "product added",
      });
    } catch (error) {
      return res.status(200).json({
        success: false,
        data: {
          product: null,
        },
        message: "failed to add product",
      });
    }
  }
);

/*
type : PUT
path : /api/v1/product/:id
params : id
isProtected: true (admin)
*/

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(300).json({
          product: null,
          message: "Invalid category",
        });
    }

    const product = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.status(200).json({
      product,
      message: "Updated product in DB",
    });
  } catch (error) {
    return res.status(500).json({
      product: null,
      message: "Unable to update product in DB",
    });
  }
});

/*
type : DELETE
path : /api/v1/product/:id
params : id
isProtected: true (admin)
*/

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Product.findByIdAndRemove(id);
    res.status(200).json({
      category,
      message: "deleted category in DB",
    });
  } catch (error) {
    return res.status(500).json({
      category: null,
      message: "Unable to delete category in DB",
    });
  }
});

// /*
// type : PUT
// path : /api/v1/product/updateStock/:id
// params : id
// isProtected: true (admin)
// */

// router.put('/updateStock/:id'
//     , async (req, res) => {
//         const { id } = req.params
//         try {
//             const category = await Product.findByIdAndRemove(id)
//             res.status(200).json({
//                 category, message: "deleted category in DB"
//             })
//         } catch (error) {
//             return res.status(500).json({
//                 category: null,
//                 message: "Unable to delete category in DB"
//             })
//         }
//     })

export default router;
