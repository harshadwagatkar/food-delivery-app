import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";
import { serverURL } from "../App";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import "../leafletIconFix";
import { setFinalAddress, setLocation } from "../redux/mapSlice";
import toast from "react-hot-toast";

//function to keep the map pointer at the center of the map
import { useMap } from "react-leaflet";
import { addMyOrders, clearCart } from "../redux/userSlice";
function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], map.getZoom(), {
      animate: true,
    });
  }, [position, map]);

  return null;
}

//our main function
function CheckOut() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.user);
  const { location, finalAddress } = useSelector((state) => state.map);

  /* ---------------- MAP POSITION ---------------- */
  const [position, setPosition] = useState({
    lat: location?.lat || 19.076,
    lng: location?.lng || 72.8777,
  });

  // keep marker synced with redux
  useEffect(() => {
    if (location?.lat && location?.lng) {
      setPosition({
        lat: location.lat,
        lng: location.lng,
      });
    }
  }, [location]);

  /* ---------------- DRAG HANDLER ---------------- */
  const onDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();

    setPosition({ lat, lng }); // marker stays
    dispatch(setLocation({ lat, lng })); // redux update
    fetchLocation(lat, lng); // update address
  };

  /* ---------------- FETCH ADDRESS ---------------- */
  const fetchLocation = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${
          import.meta.env.VITE_OPEN_CAGE_API_KEY
        }&language=en&countrycode=in`,
      );

      if (!response.data.results.length) {
        toast.error("Unable to fetch address for this location");
        return;
      }

      const resultAddress = response.data.results[0].formatted;
      dispatch(setFinalAddress(resultAddress));
      toast.success("Location updated");
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch location details");
    }
  };

  /* ---------------- SEARCH ---------------- */
  const [searchText, setSearchText] = useState(finalAddress || "");
  // const [suggestions, setSuggestions] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    setSearchText(finalAddress || "");
  }, [finalAddress]);

  const handleSearchLocation = async () => {
    if (!searchText.trim()) {
      toast.error("Please enter an address");
      return;
    }

    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          searchText,
        )}&key=${
          import.meta.env.VITE_OPEN_CAGE_API_KEY
        }&language=en&countrycode=in`,
      );

      if (!response.data.results.length) {
        toast.error("No location found for this address");
        return;
      }

      const lat = response.data.results[0].geometry.lat;
      const lng = response.data.results[0].geometry.lng;

      setPosition({ lat, lng });
      dispatch(setLocation({ lat, lng }));

      fetchLocation(lat, lng);
      toast.success("Map updated to searched location");
    } catch (error) {
      console.log(error);
      toast.error("Unable to search location");
    }
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setPosition({ lat, lng });

        dispatch(setLocation({ lat, lng }));

        fetchLocation(lat, lng);
      },
      (error) => {
        console.log(error);
        alert("Unable to fetch live location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  /* ---------------- ORDER TOTALS ---------------- */
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = itemTotal > 500 ? 0 : 40;
  const taxes = 20;
  const grandTotal = itemTotal + deliveryFee + taxes;

  /* ---------------- PLACE ORDER ---------------- */
  const handlePlaceOrder = async () => {
    if (!searchText) {
      toast.error("Please select a delivery address");
      return;
    }

    const orderPayload = {
      deliveryAddress: {
        text: finalAddress,
        latitude: location.lat,
        longitude: location.lng,
      },
      paymentMethod,
      cartItems,
      totalAmount: grandTotal,
    };

    try {
      const response = await axios.post(
        `${serverURL}/api/order/place-order`,
        orderPayload,
        { withCredentials: true },
      );

      // console.log(response.data);

      if (paymentMethod === "COD") {
        dispatch(addMyOrders(response.data));
        dispatch(clearCart());
        toast.success("Order placed successfully");
        navigate("/order-placed");
      } else {
        const razorOrder = response.data.razorOrder;
        openRazorPayWindow(razorOrder);
      }
    } catch (error) {
      console.log(error);
    }
    // console.log("ORDER DATA:", orderPayload);
  };

  const openRazorPayWindow = (razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_API_KEY,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Soez",
      description: "Order Payment",
      order_id: razorOrder.id,

      handler: async function (result) {
        try {
          const response = await axios.post(
            `${serverURL}/api/order/verify-payment`,
            {
              razorpay_payment_id: result.razorpay_payment_id,
              razorpay_order_id: result.razorpay_order_id,
              razorpay_signature: result.razorpay_signature,

              cartItems,
              deliveryAddress: {
                text: finalAddress,
                latitude: location.lat,
                longitude: location.lng,
              },
              totalAmount: grandTotal,
              paymentMethod,
            },
            { withCredentials: true },
          );

          dispatch(addMyOrders(response.data));
          dispatch(clearCart());
          toast.success("Order placed successfully");
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
          toast.error("Payment verification failed");
        }
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function () {
      toast.error("Payment Failed ❌");
    });

    rzp.on("modal.closed", function () {
      console.log("User closed payment window");
    });

    rzp.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6">
            {/* LOCATION CARD */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <FaMapMarkerAlt className="text-orange-500" />
                Delivery Location
              </h3>

              <div className="relative mb-3 flex gap-2">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search delivery address"
                  className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
                />

                <div
                  onClick={handleSearchLocation}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl cursor-pointer hover:bg-orange-600 flex items-center justify-center"
                >
                  Locate
                </div>

                <div
                  onClick={handleLiveLocation}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 flex items-center justify-center"
                >
                  Live
                </div>
              </div>

              {/* MAP */}
              <MapContainer
                center={[position.lat, position.lng]}
                zoom={15}
                className="h-64 rounded-xl"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap position={position} />
                <Marker
                  position={[position.lat, position.lng]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              </MapContainer>
            </div>

            {/* PAYMENT METHODS */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Payment Method
              </h3>

              <div className="space-y-4">
                <label className="flex items-center gap-4 border rounded-xl p-4 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-orange-500"
                  />
                  <FaMoneyBillWave className="text-green-600" />
                  Cash on Delivery
                </label>

                <label className="flex items-center gap-4 border rounded-xl p-4 cursor-pointer">
                  <input
                    type="radio"
                    checked={paymentMethod === "ONLINE"}
                    onChange={() => setPaymentMethod("ONLINE")}
                    className="accent-orange-500"
                  />
                  <FaCreditCard className="text-blue-600" />
                  UPI / Card / NetBanking
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Order Summary
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}

              <hr />

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : "₹" + deliveryFee}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & Charges</span>
                <span>₹{taxes}</span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-gray-800 text-base">
                <span>Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              {paymentMethod == "COD" ? "Place Order" : "Pay & Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckOut;
