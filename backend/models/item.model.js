import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    }, 
    image : {
        type : String,
        required : true,
    },
    shop : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Shop"
    },
    category : {
        type : String,
        enum : ["Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others"
        ],
        required : true
    },
    price : {
        type : Number ,
        min : 0,
        required : true
    },
    foodType : {
        type : String ,
        enum : ["veg","non-veg"],
        required : true
    },
    ratings : [{
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
        },
        value : {
            type : Number,
            min : 1,
            max : 5,
            required : true,
        }
    }],
    ratingAverage : {
        type : Number,
        default : 0,
    },
    ratingCount : {
        type : Number,
        default : 0,
    },

}, {timestamps : true})

const Item = mongoose.model("Item", itemSchema) 
export default Item