import React, { useState } from "react";
import { FaPlus, FaMinus, FaStar, FaShoppingCart } from "react-icons/fa";
import RatingPopup from "./RatingPopup";
import axios from "axios";
import { serverURL } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";
import toast from "react-hot-toast";

function ItemsCard({ item }) {
  const [showRating, setShowRating] = useState(false);
  const [ratingAverage, setRatingAverage] = useState(item.ratingAverage || 0);
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);

  const handleRatingSubmit = async (rating) => {
    try {
      const response = await axios.post(
        `${serverURL}/api/item/rate-item`,
        { itemId: item._id, rating },
        { withCredentials: true },
      );
      setRatingAverage(response.data.ratingAverage);
      setShowRating(false);
      toast.success("Rating submitted!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit rating");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group cursor-pointer">
        {/* IMAGE */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

          {/* VEG / NON-VEG */}
          <div className="absolute top-2 left-2 bg-white p-[2px] rounded-sm">
            <span
              className={`block w-3 h-3 rounded-sm ${
                item.foodType === "veg" ? "bg-green-600" : "bg-red-600"
              }`}
            ></span>
          </div>

          {/* RATING */}
          <div
            onClick={() => setShowRating(true)}
            className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-[2px] rounded-full text-xs font-semibold cursor-pointer hover:scale-105 transition"
          >
            <FaStar className="text-yellow-400" />
            {ratingAverage}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {item.name}
          </h3>

          <p className="text-xs text-gray-500 mt-1">{item.category}</p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-base font-bold text-gray-900">₹{item.price}</p>

            {/* ADD TO CART UI */}
            {quantity === 0 ? (
              <button
                onClick={() => setQuantity(1)}
                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition"
              >
                <FaPlus size={12} />
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-2 py-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                >
                  <FaMinus size={10} />
                </button>

                <span className="text-sm font-semibold text-orange-600 w-4 text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                >
                  <FaPlus size={10} />
                </button>

                <FaShoppingCart
                  className="text-orange-500 ml-1 cursor-pointer hover:text-orange-600 transition"
                  onClick={() => {
                    dispatch(
                      addToCart({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        shop: item.shop,
                        quantity: quantity,
                        foodType: item.foodType,
                      }),
                    );
                    toast.success(`${item.name} added to cart`);
                    setQuantity(0);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RATING POPUP */}
      {showRating && (
        <RatingPopup
          onClose={() => setShowRating(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </>
  );
}

export default ItemsCard;
