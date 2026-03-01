import express from "express"
import { addItem, deleteItem, editItem, getItemData, getItemsByCity, getItemsByShop, rateItem, searchItems } from "../controllers/items.controllers.js"
import { upload } from "../middlewares/multer.js"
import isAuth from "../middlewares/isAuth.js"

const itemRouter = express.Router()

itemRouter.post("/add-item", isAuth, upload.single("image") ,addItem)
itemRouter.post("/edit-item/:itemId", isAuth, upload.single("image") , editItem)
itemRouter.get("/get-item-data/:itemId", getItemData)
itemRouter.get("/delete-item/:itemId", isAuth, deleteItem)
itemRouter.get("/get-city-items/:city", isAuth, getItemsByCity)
itemRouter.get("/get-shop-items/:shopId", isAuth, getItemsByShop)
itemRouter.get("/search-items", isAuth, searchItems)
itemRouter.post("/rate-item", isAuth, rateItem)

export default itemRouter