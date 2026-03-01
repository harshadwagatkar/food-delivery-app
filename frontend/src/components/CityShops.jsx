import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { serverURL } from "../App";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function CityShops() {
  const { city } = useSelector(state => state.user);
  const navigate = useNavigate();

  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${serverURL}/api/shop/get-shop-city/${city}`,
          { withCredentials: true }
        );

        setAllShops(response.data);
      } catch (error) {
        console.log(error);
        setAllShops([]);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchShops();
    }
  }, [city]);

  return (
    <div className="w-full bg-[#fff7f2] px-4 py-10">
      <div className="max-w-7xl mx-auto">
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          Restaurants Near You 🍽️
        </h2>

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500 text-center">Loading shops...</p>
        )}

        {/* SHOPS GRID */}
        {!loading && allShops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allShops.map((shop) => (
              <div
                key={shop._id}
                onClick={() => navigate(`/shop-items/${shop._id}`)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {shop.name}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                    <FaMapMarkerAlt className="text-orange-500" />
                    <span>{shop.address}</span>
                  </div>

                  <p className="text-sm text-orange-500 font-medium mt-3">
                    {shop.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && allShops.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            No shops available in your city 😔
          </div>
        )}
      </div>
    </div>
  );
}

export default CityShops;
