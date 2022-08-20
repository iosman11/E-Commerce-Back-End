const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    const categoryData = await Product.findAll({
      attributes: ["id", "product_name", "price", "stock"],
      includes: [
        {
          model: Category,
          attributes: ["category_name"],
        },
        {
          model: Tag,
          attributes: ["tag_name"],
        },
      ],
    });
    res.status(200).json(categoryData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Product.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "product_name", "price", "stock"],
      includes: [
        {
          model: Category,
          attributes: ["category_name"],
        },
        {
          model: Tag,
          attributes: ["tag_name"],
        },
      ],
    });
    res.status(200).json(categoryData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", async (req, res) => {
  try {
    const categoryData = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(categoryData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
});
// Old function for Product Update for reference
// router.put("/:id", (req, res) => {
//   // update product data
//   Product.update(req.body, {
//     where: {
//       id: req.params.id,
//     },
//   })
//     .then((product) => {
//       // find all associated tags from ProductTag
//       return ProductTag.findAll({ where: { product_id: req.params.id } });
//     })
//     .then((productTags) => {
//       // get list of current tag_ids
//       const productTagIds = productTags.map(({ tag_id }) => tag_id);
//       // create filtered list of new tag_ids
//       const newProductTags = req.body.tagIds
//         .filter((tag_id) => !productTagIds.includes(tag_id))
//         .map((tag_id) => {
//           return {
//             product_id: req.params.id,
//             tag_id,
//           };
//         });
//       // figure out which ones to remove
//       const productTagsToRemove = productTags
//         .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
//         .map(({ id }) => id);

//       // run both actions
//       return Promise.all([
//         ProductTag.destroy({ where: { id: productTagsToRemove } }),
//         ProductTag.bulkCreate(newProductTags),
//       ]);
//     })
//     .then((updatedProductTags) => res.json(updatedProductTags))
//     .catch((err) => {
//       console.log(err);
//       res.status(400).json(err);
//     });
// });

router.delete("/:id", (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbProductData) => {
      if (!dbProductData) {
        rs.status(404).json({ message: "No product found with this id" });
        return;
      }
      res.json(dbProductData);
    })
    .catch((error) => {
      console.log(error.message);
      res.status(500).json({ error: "Failed to delete Product" });
    });
});

module.exports = router;
