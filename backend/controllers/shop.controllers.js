import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import fs from "fs";


export const createEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;

    // 🔹 Basic validation
    if (!name || !city || !state || !address) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    // 🔹 Find existing shop
    let shop = await Shop.findOne({ owner: req.userId });

    let imageUrl;

    // 🔹 Upload image if provided
    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    // 🔹 Image required only when creating shop
    if (!shop && !imageUrl) {
      return res.status(400).json({
        msg: "Restaurant image is required",
      });
    }

    // 🔹 CREATE
    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image: imageUrl,
        owner: req.userId,
      });

      await shop.populate("owner items");

      return res.status(201).json(shop);
    }

    // 🔹 UPDATE
    const updateData = {
      name,
      city,
      state,
      address,
      owner : req.userId
    };

    // update image only if new one uploaded
    if (imageUrl) {
      updateData.image = imageUrl;
    }

    shop = await Shop.findByIdAndUpdate(
      shop._id,
      updateData,
      { new: true }
    ).populate("owner");

    return res.status(200).json(shop);

  } catch (error) {
    console.error("Create/Edit Shop Error:", error);
    return res.status(500).json({ 
      msg: "Create/Edit shop error",
      error: error.message,
    });
  }
};


export const getShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId }).populate(
      "owner"
    ) 
    
    if (!shop) {
      return null;
    }

    await shop.populate({
            path : "items",
            options : {
                sort : {updatedAt:-1}
            }
        });


    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ msg: "Get shop error: ", error });
  }
};

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: `^${city}$`, $options: "i" }
    });

    if (shops.length === 0) {
      return res.status(404).json({
        msg: "No shops found in this city"
      });
    }

    return res.status(200).json(shops);

  } catch (error) {
    return res.status(500).json({
      msg: "Get shop by city error",
      error: error.message
    });
  }
};
