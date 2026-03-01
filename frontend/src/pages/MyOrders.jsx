import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { addMyOrders, updateOrderStatusRealtime } from "../redux/userSlice";

function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      // shopOrders is ALWAYS an array now
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
  }, [socket, userData._id, dispatch]);

  if (!userData || !myOrders) return null;

  if (myOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-6 relative overflow-hidden">
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <p className="text-gray-600 text-lg">No orders found</p>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600 transition"
          >
            <FaArrowLeft />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-6 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-0 -left-24 w-72 h-72 bg-orange-300 rounded-full opacity-20"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft />
          </button>

          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        </div>

        {/* ORDERS */}
        {myOrders.map((order) =>
          userData.role === "owner" ? (
            <OwnerOrderCard key={order._id} order={order} />
          ) : (
            <UserOrderCard key={order._id} order={order} />
          ),
        )}
      </div>
    </div>
  );
}

export default MyOrders;
