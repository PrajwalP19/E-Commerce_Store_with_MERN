import { Product } from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //get all the products
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    //if not in redis, fetch it from mongoDB
    //.lean() is gonna return a plain js object instead of mongoDB document which is goood for performance

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    // if (!featuredProducts) {
    //     return res.status(404).json({message: "No featured products found!!"})
    // }

    if (featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found!!" });
    }

    //store in redis for future quick access

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    // Basic validation
    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let cloudinaryResponse = null;

    if (image) {
      try {
        cloudinaryResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
      } catch (err) {
        return res
          .status(500)
          .json({ message: "Image upload failed", error: err.message });
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const deleteProduct = async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id)

//         if (!product) {
//             return res.status(404).json({ message: "Product not found!!" });
//         }

//         if (product.image) {
//             const publicId = product.image.split("/").pop().split(".")[0]
//             try {
//                 await cloudinary.uploader.destroy(`products/${publicId}`)
//                 console.log("Image deleted from cloudinary");
//             } catch (error) {
//                 console.log("Error in deleting image from cloudinary!!", error.message);
//             }
//         }

//         await Product.findByIdAndDelete(req.params.id)

//         res.json({message: "Product deleted successfully"})
//     } catch (error) {
//         console.log("Error in deleteProduct controller", error.message);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found!!" });
    }

    if (product.image) {
      try {
        const publicIdWithFolder = product.image
          .split("/products/")[1]
          ?.split(".")[0];

        if (publicIdWithFolder) {
          await cloudinary.uploader.destroy(`products/${publicIdWithFolder}`);
          console.log("Image deleted from Cloudinary");
        } else {
          console.warn("Could not extract public ID from image URL");
        }
      } catch (error) {
        console.log("Error deleting image from Cloudinary:", error.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    // Optional Redis cache invalidation
    // await redis.del("featured_products");

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducst controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category });
    res.json({products});
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();

      //update the redis cache

      await updateFeaturedProductCache();

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//function to set the cache

async function updateFeaturedProductCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts),
      "EX",
      3600
    );

    console.log("Redis cache updated: featured_products");
  } catch (error) {
    console.log("Error in updating cache function:", error.message);
  }
}
