import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { serverURL } from "../App";
import { setShopData } from "../redux/ownerSlice";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";

function CreateEditShop() {
  const [preview, setPreview] = useState(null);
  const { city, state, address } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  //shop data
  const { shopData } = useSelector((state) => state.owner);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    // image: null,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      city: city || "",
      state: state || "",
      address: address || "",
    }));
  }, [city, state]);

  // useEffect(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     name: shopData.name || "",
  //   }));
  // }, [])

  useEffect(() => {
    if (shopData) {
      setFormData((prev) => ({
        ...prev,
        name: shopData.name || "",
        city: shopData.city || "",
        state: shopData.state || "",
        address: shopData.address || "",
      }));
    }
  }, [shopData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // setFormData({ ...formData, image: file });
      setBackendImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("address", formData.address);

      // if (formData.image) {
      //   data.append("image", formData.image);
      // }
      if (backendImage) {
        data.append("image", backendImage);
      }

      const response = await axios.post(
        `${serverURL}/api/shop/create-edit`,
        data,
        {
          withCredentials: true,
        }
      );

      setLoading(false)
      dispatch(setShopData(response.data));
      navigate("/")
      // console.log(response.data);
    } catch (error) {
      setLoading(false)
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff6f2] flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white text-3xl shadow mb-3">
            <MdStorefront />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            {!shopData ? "Create Your Restaurant" : "Edit Your Restaurant"}
          </h2>

          <p className="text-sm text-gray-500 mt-1 text-center">
            Add your shop details and start receiving orders
          </p>
        </div>

        {/* Image Preview */}
        <div className="flex flex-col items-center mb-6">
          {preview || shopData ? (
            <img
              src={preview ? preview : shopData.image}
              alt="Preview"
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
          <input
            type="text"
            name="name"
            placeholder="Shop Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a3c]"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a3c]"
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a3c]"
            />
          </div>

          <textarea
            name="address"
            placeholder="Full Address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a3c]"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white py-3 rounded-xl font-semibold shadow-md hover:scale-[1.02] transition"
            disabled={loading}
          >
            {loading?<ClipLoader size={20} color="white"/>:"Save Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
