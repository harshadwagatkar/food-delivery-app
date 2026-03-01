import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverURL } from "../App";
import DeliveryBoyNavbar from "./DeliveryBoyNavbar";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStore,
  FaMoneyBillWave,
  FaBoxOpen,
} from "react-icons/fa";

function DeliveredOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/api/order/delivered-orders`,
          { withCredentials: true },
        );
        setOrders(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ───────── Skeleton loader ───────── */
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-orange-300 h-24" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );

  /* ───────── Earnings summary ───────── */
  const totalEarnings = orders.reduce((sum, order) => {
    const delivered = order.shopOrders?.filter(
      (so) => so.status === "delivered",
    );
    return sum + delivered.reduce((acc, so) => acc + (so.subTotal || 0), 0);
  }, 0);

  const totalDeliveries = orders.reduce((count, order) => {
    return (
      count +
      (order.shopOrders?.filter((so) => so.status === "delivered").length || 0)
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <DeliveryBoyNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* PAGE TITLE */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📋 Delivered Orders
        </h2>

        {/* STATS CARDS */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="relative bg-white rounded-3xl shadow-lg p-6 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-green-100 rounded-full" />
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-3xl font-extrabold text-green-600 mt-1">
                {totalDeliveries}
              </p>
            </div>

            <div className="relative bg-white rounded-3xl shadow-lg p-6 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-orange-100 rounded-full" />
              <p className="text-sm text-gray-500">Total Order Value</p>
              <p className="text-3xl font-extrabold text-orange-600 mt-1">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <FaBoxOpen className="mx-auto text-orange-300 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">
              No deliveries yet
            </h3>
            <p className="text-gray-400 mt-2 text-sm">
              Completed deliveries will appear here. Go online &amp; start
              delivering! 🚴‍♂️
            </p>
          </div>
        )}

        {/* ORDER LIST */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) =>
              order.shopOrders
                ?.filter((so) => so.status === "delivered")
                .map((shopOrder) => (
                  <div
                    key={shopOrder._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
                  >
                    {/* CARD HEADER */}
                    <div className="bg-orange-500 text-white p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Order #{order._id.slice(0, 6)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm opacity-90 mt-1">
                            <FaCalendarAlt />
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Delivered
                        </span>
                      </div>
                    </div>

                    {/* DELIVERY ADDRESS */}
                    <div className="px-5 py-3 flex items-start gap-2 text-sm text-gray-700 bg-orange-50">
                      <FaMapMarkerAlt className="text-orange-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">
                        {order.deliveryAddress?.text}
                      </span>
                    </div>

                    {/* SHOP + ITEMS */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-orange-600 font-semibold mb-3">
                        <FaStore />
                        {shopOrder.shop?.name || "Shop"}
                      </div>

                      <div className="space-y-3">
                        {shopOrder.shopOrderItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {item.item?.image && (
                                <img
                                  src={item.item.image}
                                  alt={item.item?.name || item.name}
                                  className="w-12 h-12 rounded-xl object-cover border"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-800 text-sm">
                                  {item.item?.name || item.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>

                            <p className="font-semibold text-gray-700 text-sm">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* FOOTER */}
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <FaMoneyBillWave className="text-green-500" />
                          {order.paymentMethod}
                        </div>
                        <p className="font-bold text-gray-800">
                          ₹{shopOrder.subTotal}
                        </p>
                      </div>

                      {shopOrder.deliveredAt && (
                        <p className="mt-2 text-xs text-gray-400 text-right">
                          Delivered on{" "}
                          {new Date(shopOrder.deliveredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveredOrders;
