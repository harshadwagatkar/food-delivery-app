import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, price, foodType } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });

    if (!shop) {
      return res.status(400).json({ msg: "Shop not found" });
    }
    const item = await Item.create({
      name,
      category,
      price,
      foodType,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate("owner");
    await shop.populate({
      path: "items",
      options: {
        sort: { updatedAt: -1 },
      },
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ msg: "Add item error: ", error });
  }
};

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, foodType, category, price } = req.body;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, foodType, category, price, image },
      { new: true }
    );

    if (!item) {
      return res.status(400).json({ msg: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: {
        sort: { updatedAt: -1 },
      },
    });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ msg: "Edit item error: ", error });
  }
};

export const getItemData = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(400).json({ msg: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ msg: "Get item data error: ", error });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ msg: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(404).json({ msg: "Shop not found" });
    }

    shop.items = shop.items.filter((i) => i.toString() !== item._id.toString());

    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json(shop);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Delete item error",
      error: error.message,
    });
  }
};

export const getItemsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: `^${city}$`, $options: "i" },
    }).select("_id");

    if (shops.length === 0) {
      return res.status(404).json({
        msg: "No shops found in this city",
      });
    }

    const shopIds = shops.map(shop => shop._id);

    const items = await Item.find({
        shop : {$in : shopIds}
    })

    return res.status(200).json(items)

  } catch (error) {
    return res.status(500).json({ msg: "Get item data by city error: ", error });
  }
};

export const getItemsByShop = async (req, res) => {
  try {
    const {shopId} = req.params
    const shop = await Shop.findById(shopId)
    .populate("items")
    .populate("owner", "fullName")

    if(!shop) {
      return res.status(400).json({msg : "No shop found"})
    }
    const allItems = shop.items

    return res.status(200).json({
      name : shop.name,
      image : shop.image,
      owner : shop.owner,
      city : shop.city,
      address : shop.address,
      allItems
    })

  } catch (error) {
    return res.status(500).json({ msg: "Get item data by shop error: ", error });    
  }
}

export const rateItem = async (req, res) => {
    try {
        const {itemId, rating} = req.body;
        const userId = req.userId;

        if(!rating || rating < 1 || rating > 5) {
            return res.status(400).json({msg : "Rating must be between 1 and 5"})
        }

        const item = await Item.findById(itemId);
        if(!item) {
            return res.status(400).json({msg : "Item not found"})
        }

        //check if user already rated
        const existingRating = item.ratings.find(
            (r) => r.user.toString() === userId
        );

        if(existingRating) {
            //update the rating
            existingRating.value = rating;
        } else {
            //add new rating
            item.ratings.push({user: userId, value: rating});
            item.ratingCount += 1;
        }

        //calcculate average
        const total = item.ratings.reduce((sum, r) => sum + r.value, 0);
        item.ratingAverage = (total/item.ratingCount).toFixed(1);

        await item.save();

        return res.status(200).json({
            msg : "Rating updated successfully",
            ratingAverage : item.ratingAverage,
            ratingCount : item.ratingCount,
        });

    } catch (error) {
    return res.status(500).json({ msg: "Get item rating data error: ", error });
        
    }
}

export const searchItems = async (req, res) => {
  try {
    const {query, city} = req.query;

    if(!query || !city) {
      return res.status(400).json({msg : "Query and city required"})
    }

    const shops = await Shop.find({city})

    const shopIds = shops.map(shop =>  shop._id)

    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    })
    .populate("shop", "name address city")
    .limit(20);

    return res.status(200).json(items)

  } catch (error) {
    return res.status(500).json({ msg: "search items error: ", error });
  }
}
