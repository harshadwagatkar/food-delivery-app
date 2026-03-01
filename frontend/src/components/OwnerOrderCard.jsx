import React, { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStore,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "axios";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

function OwnerOrderCard({ order }) {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const shopOrder = order.shopOrders[0];
  // console.log(order);
  const [status, setStatus] = useState(shopOrder.status);

  const handleStatusChange = async (e, orderId, shopId) => {
    const newStatus = e.target.value;
    setStatus(e.target.value);
    try {
      const response = await axios.post(
        `${serverURL}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus },
        { withCredentials: true },
      );
      dispatch(updateOrderStatus({ orderId, shopId, newStatus }));
      setAvailableBoys(response.data.availableBoys);
      // console.log("Here is data boys" , availableBoys);
      // console.log("Here is data" , response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    // accepted: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700",
    out_of_delivery: "bg-purple-100 text-purple-700",
    // delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className=" bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-6">
      {/* // <div className="bg-white rounded-2xl shadow-lg overflow-hidden px-4 py-6"> */}

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* HEADER */}
        <div className="bg-orange-500 text-white p-5 flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg">
              Order #{order._id.slice(0, 6)}
            </h2>
            <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
              <FaCalendarAlt />
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="text-xs mt-2">
              <p>
                Payment Method:{" "}
                <span className="font-semibold">{order.paymentMethod}</span>
              </p>

              <p>
                Payment Status:{" "}
                {order.payment ? (
                  <span className="text-green-200 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-200 font-semibold">Unpaid</span>
                )}
              </p>
            </div>
          </div>

          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e, order._id, shopOrder.shop._id)
            }
            disabled={status === "delivered"}
            className={`bg-white px-4 py-2 rounded-full text-sm font-semibold shadow 
  ${
    status === "delivered"
      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
      : "text-orange-600"
  }`}
          >
            {/* <option value="">Change</option> */}
            <option value="pending">Pending</option>
            {/* <option value="accepted">Accepted</option> */}
            <option value="preparing">Preparing</option>
            <option value="out_of_delivery">Out of delivery</option>
            {/* <option value="delivered">Delivered</option> */}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* CUSTOMER INFO */}
        <div className="p-5 bg-orange-50 border-b">
          <h3 className="font-semibold text-orange-600 mb-3">
            Customer Details
          </h3>

          <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <FaUser className="text-orange-500" />
              {order.user.fullName}
            </p>

            <p className="flex items-center gap-2">
              <FaPhone className="text-orange-500" />
              {order.user.mobile}
            </p>

            <p className="flex items-center gap-2">
              <FaEnvelope className="text-orange-500" />
              {order.user.email}
            </p>

            <p className="flex items-start gap-2 sm:col-span-2">
              <FaMapMarkerAlt className="text-orange-500 mt-1" />
              {order.deliveryAddress.text}
            </p>
          </div>
        </div>

        {/* SHOP + ITEMS */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <FaStore />
            {shopOrder.shop.name}
          </div>

          {/* ITEMS */}
          <div className="space-y-4">
            {shopOrder.shopOrderItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-gray-800">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DELIVERY BOY SECTION */}
        {status === "out_of_delivery" && (
          <div className="px-6 pb-4">
            <h3 className="text-sm font-semibold text-orange-600 mb-3">
              Delivery Status
            </h3>

            {/* ✅ If Assigned */}
            {shopOrder.assignedDeliveryBoy ? (
              <div className="border rounded-xl px-4 py-4 bg-green-50 shadow-sm flex flex-col gap-2">
                <p className="text-sm text-green-700 font-semibold">
                  🚚 Assigned Delivery Boy
                </p>

                <p className="font-semibold text-gray-800 text-sm">
                  {shopOrder.assignedDeliveryBoy.fullName}
                </p>

                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="text-orange-500 text-xs" />
                  <a
                    href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                    className="hover:text-orange-600"
                  >
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </a>
                </p>
              </div>
            ) : (
              /* 🔵 If Not Assigned → Show Available Boys */
              <>
                {shopOrder.assignment && !shopOrder.assignedDeliveryBoy ? (
                  <p className="text-sm text-orange-600">
                    Waiting for delivery boy to accept...
                  </p>
                ) : availableBoys ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {availableBoys.map((boy) => (
                      <div
                        key={boy.id}
                        className="border rounded-xl px-4 py-3 bg-orange-50 flex flex-col gap-1 shadow-sm"
                      >
                        <p className="font-semibold text-gray-800 text-sm">
                          {boy.fullName}
                        </p>

                        <p className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-orange-500 text-xs" />
                          <a
                            href={`tel:${boy.mobile}`}
                            className="hover:text-orange-600"
                          >
                            {boy.mobile}
                          </a>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No delivery boys available nearby
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
