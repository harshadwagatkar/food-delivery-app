import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverURL } from "../App";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user);
  const [liveLocation, setLiveLocation] = useState({});

  const handleGetOrder = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      console.log(response.data);
      console.log(response.data.shopOrders);
      setCurrentOrder(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // const shopOrder = currentOrder?.shopOrders[0];

  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocation((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    };

    socket.on("updateDeliverylocation", handleLocationUpdate);

    return () => {
      socket.off("updateDeliverylocation", handleLocationUpdate);
    };
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={() => navigate("/my-orders")}
            className="text-orange-600 font-semibold hover:text-orange-700 transition"
          >
            ← Back to My Orders
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mt-4 sm:mt-0">
            📦 Track Your Order
          </h2>
        </div>

        {currentOrder && (
          <>
            {/* ORDER SUMMARY */}
            <div className="bg-white rounded-3xl shadow-md p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-orange-600 mb-4">
                Order Summary
              </h3>

              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <p>
                  <strong>Order ID:</strong> {currentOrder._id}
                </p>
                <p>
                  <strong>Payment:</strong> {currentOrder.paymentMethod}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(currentOrder.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Total Amount:</strong>{" "}
                  <span className="text-orange-600 font-semibold">
                    ₹{currentOrder.totalAmount}
                  </span>
                </p>
              </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="bg-white rounded-3xl shadow-md p-6 border border-orange-100">
              <h3 className="text-lg font-bold text-orange-600 mb-3">
                Delivery Address
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {currentOrder.deliveryAddress.text}
              </p>
            </div>

            {/* LOOP THROUGH ALL SHOP ORDERS */}
            {currentOrder.shopOrders.map((shopOrder, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-md p-6 border border-orange-200 space-y-6"
              >
                {/* SHOP INFO */}
                <div>
                  <h3 className="text-lg font-bold text-orange-600 mb-2">
                    🏪 Shop: {shopOrder.shop?.name || "Shop"}
                  </h3>

                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong>{" "}
                    <span className="text-orange-500 font-semibold">
                      {shopOrder.status}
                    </span>
                  </p>
                </div>

                {/* ITEMS OF THIS SHOP */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Items from this shop
                  </h4>

                  <div className="space-y-2">
                    {shopOrder.shopOrderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between text-sm border-b pb-1"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-3 font-semibold text-orange-600">
                    <span>Subtotal</span>
                    <span>₹{shopOrder.subTotal}</span>
                  </div>
                </div>

                {/* DELIVERY PARTNER FOR THIS SHOP */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    🚚 Delivery Partner
                  </h4>

                  {shopOrder.assignedDeliveryBoy ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Name:</strong>{" "}
                        {shopOrder.assignedDeliveryBoy.fullName}
                      </p>
                      <p>
                        <strong>Mobile:</strong>{" "}
                        {shopOrder.assignedDeliveryBoy.mobile}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Delivery partner not assigned yet.
                    </p>
                  )}
                </div>

                {/* TRACKING MAP FOR THIS SHOP */}
                {shopOrder.status === "out_of_delivery" &&
                  shopOrder.assignedDeliveryBoy && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">
                        🚚 Live Tracking
                      </h4>

                      <DeliveryBoyTracking
                        data={{
                          deliveryBoyLocation: liveLocation[
                            shopOrder.assignedDeliveryBoy._id
                          ] || {
                            lat: shopOrder.assignedDeliveryBoy.location
                              .coordinates[1],
                            lon: shopOrder.assignedDeliveryBoy.location
                              .coordinates[0],
                          },
                          customerLocation: {
                            lat: currentOrder.deliveryAddress.latitude,
                            lon: currentOrder.deliveryAddress.longitude,
                          },
                        }}
                      />
                    </div>
                  )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default TrackOrderPage;
