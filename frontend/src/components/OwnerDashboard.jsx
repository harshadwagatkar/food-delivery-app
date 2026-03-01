import React, { useEffect, useState } from "react";
import { FiEdit, FiLoader } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import OwnerNav from "./OwnerNav";
import { useNavigate } from "react-router-dom";
import FoodCard from "./FoodCard";
import { addMyOrders, updateOrderStatusRealtime } from "../redux/userSlice";

function OwnerDashboard() {
  const [loadingShopBtn, setLoadingShopBtn] = useState(false);
  const [loadingFoodBtn, setLoadingFoodBtn] = useState(false);

  const { shopData } = useSelector((state) => state.owner);
  const { userData, socket, myOrders } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Listen for new orders & status updates in real-time
  useEffect(() => {
    if (!socket || !userData) return;

    const handleNewOrder = (data) => {
      const shopOrder = data.shopOrders?.[0];
      if (shopOrder?.owner?._id === userData._id) {
        dispatch(addMyOrders(data));
      }
    };

    const handleStatusUpdate = (data) => {
      dispatch(updateOrderStatusRealtime(data));
    };

    socket.on("newOrder", handleNewOrder);
    socket.on("update-status", handleStatusUpdate);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status", handleStatusUpdate);
    };
  }, [socket, userData, dispatch]);

  return (
    <div className="min-h-screen bg-[#fff6f2]">
      <OwnerNav showActions={!!shopData} />

      {!shopData ? (
        /* EMPTY STATE */
        <div className="flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white text-4xl shadow-lg">
              <MdRestaurant />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Add Your Restaurant
            </h2>

            <p className="text-gray-600 text-sm mb-6">
              Start your journey with{" "}
              <span className="text-[#ff5a3c] font-semibold">Soez</span>.
            </p>

            <button
              disabled={loadingShopBtn}
              onClick={() => {
                setLoadingShopBtn(true);
                navigate("/create-edit-shop");
              }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md transition
                ${
                  loadingShopBtn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ff5a3c] hover:bg-[#ff784e] text-white"
                }`}
            >
              {loadingShopBtn ? (
                <>
                  <FiLoader className="animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </div>
        </div>
      ) : (
        /* DASHBOARD CONTENT */
        <section className="px-4 py-6 space-y-6">
          {/* Heading */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white shadow">
              <MdRestaurant />
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-gray-800">
              Welcome to <span className="text-[#ff5a3c]">{shopData.name}</span>
            </h2>
          </div>

          {/* SHOP CARD */}
          <div className="relative max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-[260px] w-full">
              <img
                src={shopData.image}
                alt={shopData.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800">
                {shopData.name}
              </h3>
              <p className="text-sm text-gray-600">{shopData.address}</p>
            </div>

            <button
              disabled={loadingShopBtn}
              onClick={() => {
                setLoadingShopBtn(true);
                navigate("/create-edit-shop");
              }}
              className={`absolute top-3 right-3 p-2.5 rounded-full shadow transition flex items-center justify-center
                ${
                  loadingShopBtn
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white hover:scale-105"
                }`}
            >
              {loadingShopBtn ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiEdit />
              )}
            </button>
          </div>

          {/* ADD FOOD CARD */}
          {shopData.items.length === 0 && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white text-3xl shadow">
                <MdRestaurant />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Add Your Food Item
              </h3>

              <p className="text-sm text-gray-600 mb-5">
                Share your delicious creations with customers.
              </p>

              <button
                disabled={loadingFoodBtn}
                onClick={() => {
                  setLoadingFoodBtn(true);
                  navigate("/add-item");
                }}
                className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition
                  ${
                    loadingFoodBtn
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#ff5a3c] hover:bg-[#ff784e] text-white"
                  }`}
              >
                {loadingFoodBtn ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Add Food"
                )}
              </button>
            </div>
          )}

          {/* FOOD LIST */}
          {shopData.items.length > 0 &&
            shopData.items.map((item) => (
              <FoodCard key={item._id} item={item} />
            ))}
        </section>
      )}
    </div>
  );
}

export default OwnerDashboard;
