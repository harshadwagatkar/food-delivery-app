import React from "react";
import {
  FaStore,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTruck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function UserOrderCard({ order }) {
  if (!order) return null;

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700",
    out_of_delivery: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  // console.log(order);
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* HEADER */}
      <div className="bg-orange-500 text-white p-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">
              Order #{order._id.slice(0, 6)}
            </h2>
            <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
              <FaCalendarAlt />
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-sm bg-white text-orange-600 font-medium">
            {order.paymentMethod}
          </span>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="p-4 flex items-start gap-2 text-sm text-gray-700 bg-orange-50">
        <FaMapMarkerAlt className="text-orange-500 mt-1" />
        <span>{order.deliveryAddress?.text}</span>
      </div>

      {/* SHOP ORDERS */}
      <div className="p-6 space-y-6">
        {order.shopOrders.map((shopOrder) => (
          <div
            key={shopOrder._id}
            className="bg-white border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 text-orange-600 font-semibold">
              <FaStore />
              {shopOrder.shop?.name}
            <span
              className={`inline-block mt-1 px-4 py-1 rounded-full text-sm font-medium ${statusColor[shopOrder.status]}`}
            >
              {shopOrder.status.replaceAll("_", " ")}
            </span>
            </div>

            <div className="space-y-4">
              {shopOrder.shopOrderItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.item.image}
                      alt={item.item.name}
                      className="w-16 h-16 rounded-xl object-cover border"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-5 pt-4 border-t">
              <span className="flex items-center gap-2 text-gray-600">
                <FaMoneyBillWave />
                Subtotal
              </span>
              <span className="font-bold text-lg text-gray-800">
                ₹{shopOrder.subTotal}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="bg-orange-50 px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-lg">
          Total: <span className="text-orange-600">₹{order.totalAmount}</span>
        </span>

        <button className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-xl hover:bg-orange-600 transition" onClick={() => navigate(`/track-order/${order._id}`)}>
          <FaTruck />
          Track Order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;
