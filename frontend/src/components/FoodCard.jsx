import React, { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { MdDelete, MdCategory } from "react-icons/md";
import { BiRupee } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { setShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";

function FoodCard({ item }) {
  const { name, image, category, price, foodType } = item;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    setIsDeleting(true);
    try {
      const response = await axios.get(
        `${serverURL}/api/item/delete-item/${item._id}`,
        { withCredentials: true },
      );
      dispatch(setShopData(response.data));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 flex gap-4">
      {/* LEFT IMAGE */}
      <div className="w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col justify-between">
        {/* TOP INFO */}
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MdCategory className="text-[#ff5a3c]" />
              {category}
            </span>

            <span
              className={`px-2 py-0.5 rounded-full font-semibold text-white
                ${foodType === "Veg" ? "bg-green-600" : "bg-red-600"}`}
            >
              {foodType}
            </span>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex items-center justify-between mt-2">
          {/* PRICE */}
          <div className="flex items-center text-xl font-extrabold text-[#ff5a3c]">
            <BiRupee />
            {price}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit-item/${item._id}`)}
              className="flex items-center gap-1 text-xs font-semibold text-[#ff5a3c] hover:text-[#ff784e] transition"
            >
              <FiEdit size={14} />
              Edit
            </button>

            <button
              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 disabled:text-red-300 disabled:cursor-not-allowed transition"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <MdDelete size={16} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
