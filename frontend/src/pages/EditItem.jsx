import axios from "axios";
import React, { useState } from "react";
import { FiUpload, FiLoader } from "react-icons/fi";
import { MdFastfood } from "react-icons/md";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { setShopData } from "../redux/ownerSlice";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const categories = [
  "Snacks",
  "Main Course",
  "Desserts",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "South Indian",
  "North Indian",
  "Chinese",
  "Fast Food",
  "Others",
];

function EditItem() {
  const dispatch = useDispatch();
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false);

  //here is your params
  const params = useParams();
  const [itemData, setItemData] = useState(null);

  //getting all item data
  useEffect(() => {
    const getItemData = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/item/get-item-data/${params.itemId}`,
          { withCredentials: true }
        );
        console.log(response.data);
        setItemData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getItemData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    foodType: "",
    price: "",
  });

  useEffect(() => {
    if (itemData) {
      setFormData((prev) => ({
        ...prev,
        name: itemData.name || "",
        category: itemData.category || "",
        foodType: itemData.foodType || "",
        price: itemData.price || "",
      }));
    }
  }, [itemData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    // console.log({ ...formData, image });
    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("foodType", formData.foodType);
      data.append("price", formData.price);

      if (image) {
        data.append("image", image);
      }

      const response = await axios.post(
        `${serverURL}/api/item/edit-item/${params.itemId}`,
        data,
        { withCredentials: true }
      );

      // console.log(response.data);
      setLoading(false)
      dispatch(setShopData(response.data));
      navigate("/")

    } catch (error) {
      setLoading(false)
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6f2] flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white text-3xl shadow mb-3">
            <MdFastfood />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Edit Food Item</h2>

          <p className="text-sm text-gray-500 mt-1 text-center">
            Edit your food item 🍔
          </p>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center mb-6">
          {preview || itemData ? (
            <img
              src={preview ? preview : itemData.image}
              alt="Food Preview"
              className="w-40 h-28 object-cover rounded-xl shadow mb-3"
            />
          ) : (
            <div className="w-40 h-28 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              No Image
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer bg-[#ff5a3c] text-white px-4 py-2 rounded-lg hover:bg-[#ff784e] transition">
            <FiUpload />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Food Name */}
          <input
            type="text"
            name="name"
            placeholder="Food Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ff5a3c]"
          />

          {/* Category */}
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ff5a3c]"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Food Type */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Food Type</p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, foodType: "veg" })}
                className={`flex-1 py-2 rounded-xl border font-semibold transition
                  ${
                    formData.foodType === "veg"
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "hover:bg-gray-100"
                  }`}
              >
                🟢 Veg
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, foodType: "non-veg" })
                }
                className={`flex-1 py-2 rounded-xl border font-semibold transition
                  ${
                    formData.foodType === "non-veg"
                      ? "bg-red-100 border-red-500 text-red-700"
                      : "hover:bg-gray-100"
                  }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#ff5a3c]"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-md transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white hover:scale-[1.02]"
              }`}
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin text-lg" />
                Saving...
              </>
            ) : (
              "Save Food Item"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditItem;
