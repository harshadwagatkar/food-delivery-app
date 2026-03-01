import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import ItemsCard from "./ItemsCard";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { serverURL } from "../App";

function ShopItemsPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/item/get-shop-items/${shopId}`,
          { withCredentials: true },
        );
        console.log(response.data);
        setShop(response.data);
        setShopItems(response.data.allItems);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  return (
    <div className="bg-[#fff7f2] min-h-screen">
      <Navbar />

      {/* SHOP HEADER */}
      {shop && (
        <div className="relative w-full">
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-orange-600 px-4 py-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            <FaArrowLeft />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Background Image */}
          <div className="h-64 md:h-80 w-full overflow-hidden">
            <img
              src={shop.image}
              alt={shop.name}
              className="w-full h-full object-cover brightness-75"
            />
          </div>

          {/* Shop Info Card */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white shadow-xl rounded-2xl p-6 -mt-16 relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {shop.name}
              </h1>
              <p className="text-gray-600 mt-2">📍 {shop.address}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  Owner : {shop.owner.fullName}
                </span>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  {shop.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ITEMS SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">All Items 🍽️</h2>

        {loading && (
          <p className="text-center text-gray-500">Loading items...</p>
        )}

        {!loading && shopItems.length === 0 && (
          <p className="text-center text-gray-500">
            No items available in this shop 😔
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shopItems.map((item) => (
            <ItemsCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShopItemsPage;
