import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import DeliveryBoyNavbar from "./DeliveryBoyNavbar";
import { useSelector } from "react-redux";
import { serverURL } from "../App";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import toast from "react-hot-toast";

function DeliveryBoyDashboard() {
  const { userData, socket } = useSelector((state) => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryboyLocation] = useState(null);
  const [acceptingAssignmentId, setAcceptingAssignmentId] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      ((watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setDeliveryboyLocation({
          lat: latitude,
          lon: longitude,
        });

        socket.emit("updateLocation", {
          latitude,
          longitude,
          deliveryBoyId: userData._id,
        });
      })),
        (error) => {
          console.log(error);
        },
        {
          enableHighAccurracy: true,
        });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, userData]);

  const getAssignments = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/api/order/get-assignments`,
        { withCredentials: true },
      );
      // console.log(response.data);
      setAvailableAssignments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptOrder = async (assignmentId) => {
    if (acceptingAssignmentId) return;

    setAcceptingAssignmentId(assignmentId);
    try {
      const response = await axios.get(
        `${serverURL}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true },
      );
      toast.success("Order accepted!");
      await getCurrentOrder();
      await getAssignments();
    } catch (error) {
      console.log(error);
      toast.error("Failed to accept order");
    } finally {
      setAcceptingAssignmentId(null);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/api/order/get-current-order`,
        { withCredentials: true },
      );

      if (response.data && response.data._id) {
        setCurrentOrder(response.data);
      } else {
        setCurrentOrder(null);
      }
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  const sendOtp = async () => {
    if (isSendingOtp) return;

    setIsSendingOtp(true);
    try {
      const response = await axios.post(
        `${serverURL}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true },
      );
      setShowOtpBox(true);
      toast.success("OTP sent successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (isVerifyingOtp) return;

    setIsVerifyingOtp(true);
    try {
      const response = await axios.post(
        `${serverURL}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true },
      );
      // console.log(response.data)
      toast.success("Delivered successfull");
      setCurrentOrder(null);
      setShowOtpBox(false);
      setOtp("");
      await getAssignments();
    } catch (error) {
      console.log(error);
      toast.error("Invalid OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    const handleNewAssignment = (data) => {
      setAvailableAssignments((prev) => {
        const exists = prev.find((a) => a.assignmentId === data.assignmentId);

        if (exists) return prev;

        return [...prev, data];
      });
    };

    socket.on("newAssignment", handleNewAssignment);

    return () => {
      socket.off("newAssignment", handleNewAssignment);
    };
  }, []);

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
  }, [userData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* NAVBAR */}
      <DeliveryBoyNavbar />

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* WELCOME CARD */}
        <div className="relative bg-white rounded-3xl shadow-lg p-8 overflow-hidden">
          {/* Decorative Shape */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full"></div>

          <h2 className="text-2xl font-bold text-gray-800">
            👋 Welcome,{" "}
            <span className="text-orange-600">{userData.fullName}</span>
          </h2>

          <p className="flex items-center gap-2 text-gray-600 mt-3 text-sm">
            <FaMapMarkerAlt className="text-orange-500" />
            {userData.address}
          </p>

          <p className="mt-4 text-gray-500 text-sm max-w-md">
            Stay online to receive new delivery requests near your location.
            Accept orders quickly to earn more today 🚴‍♂️
          </p>
        </div>

        {/* PLACEHOLDER SECTIONS */}
        {/* ================= CURRENT ORDER SECTION ================= */}
        {currentOrder ? (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              📦 Current Delivery
            </h3>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-orange-600">
                Order ID: {currentOrder.shopOrder._id}
              </h4>

              <p className="flex items-start gap-2 text-gray-600 text-sm mt-2">
                <FaMapMarkerAlt className="text-orange-500 mt-1" />
                {currentOrder.deliveryAddress.text}
              </p>

              {/* ITEMS */}
              <div className="mt-4 space-y-2">
                {currentOrder.shopOrder.shopOrderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-6 border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{currentOrder.shopOrder.subTotal}</span>
              </div>

              {/* CUSTOMER INFO */}
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <strong>Customer:</strong> {currentOrder.user.fullName}
                </p>
                <p>
                  <strong>Mobile:</strong> {currentOrder.user.mobile}
                </p>
              </div>
              {currentOrder && (
                <>
                  <DeliveryBoyTracking
                    data={{
                      deliveryBoyLocation: deliveryBoyLocation || {
                        lat: userData.location.coordinates[1],
                        lon: userData.location.coordinates[0],
                      },
                      customerLocation: {
                        lat: currentOrder.deliveryAddress.latitude,
                        lon: currentOrder.deliveryAddress.longitude,
                      },
                    }}
                  />

                  {!showOtpBox ? (
                    <button
                      onClick={sendOtp}
                      disabled={isSendingOtp}
                      className="mt-6 w-full bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition duration-300 shadow-md"
                    >
                      {isSendingOtp ? "Sending OTP..." : "✅ Mark As Delivered"}
                    </button>
                  ) : (
                    <div className="mt-6 bg-white p-6 rounded-xl shadow-md">
                      <div className="text-center font-semibold text-gray-700 mb-4">
                        Enter OTP sent to{" "}
                        <span className="text-orange-500">
                          {currentOrder.user.fullName}
                        </span>
                      </div>

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={isVerifyingOtp}
                        placeholder="Enter OTP"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />

                      <button
                        onClick={verifyOtp}
                        disabled={isVerifyingOtp}
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition duration-300"
                      >
                        {isVerifyingOtp ? "Verifying OTP..." : "Submit OTP"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ================= AVAILABLE ASSIGNMENTS ================= */
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              🚚 Available Delivery Requests
            </h3>

            {availableAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
                No delivery requests available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableAssignments.map((assignment) => (
                  <div
                    key={assignment.assignmentId}
                    className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition duration-300"
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-orange-600">
                        {assignment.shopName}
                      </h4>

                      <p className="flex items-start gap-2 text-gray-600 text-sm mt-2">
                        <FaMapMarkerAlt className="text-orange-500 mt-1" />
                        {assignment.deliveryAddress.text}
                      </p>
                    </div>

                    <button
                      disabled={Boolean(acceptingAssignmentId)}
                      className="mt-4 w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white py-2 rounded-xl font-medium transition duration-300"
                      onClick={() => acceptOrder(assignment.assignmentId)}
                    >
                      {acceptingAssignmentId === assignment.assignmentId
                        ? "Accepting..."
                        : "Accept Delivery"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
