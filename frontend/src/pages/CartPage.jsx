import React from "react";
import { FaArrowLeft, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeCartItem, updateQuantity } from "../redux/userSlice";

function CartPage() {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleIncrease = (id, currentQuantity) => {
    dispatch(updateQuantity({ id, quantity: currentQuantity + 1 }));
  };

  const handleDecrease = (id, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ id, quantity: currentQuantity - 1 }));
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeCartItem({ id }));
  };

  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = itemTotal > 500 ? 0 : 40;
  const taxes = 20;
  const grandTotal = itemTotal + deliveryFee + taxes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-6 relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-0 -left-24 w-72 h-72 bg-orange-300 rounded-full opacity-20"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:shadow-md transition"
          >
            <FaArrowLeft />
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Your Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-5">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Your cart is currently empty
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition"
                >
                  Browse Food
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition flex gap-4 p-4"
                >
                  {/* IMAGE */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />

                  {/* DETAILS */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>

                    <p className="text-sm text-gray-500 mt-1">₹{item.price}</p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                        <FaMinus
                          size={12}
                          onClick={() => handleDecrease(item.id, item.quantity)}
                        />
                      </button>

                      <span className="font-semibold">{item.quantity}</span>

                      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition">
                        <FaPlus
                          size={12}
                          onClick={() => handleIncrease(item.id, item.quantity)}
                        />
                      </button>
                    </div>
                  </div>

                  {/* REMOVE */}
                  <button className="text-red-500 hover:text-red-600 transition">
                    <FaTrash onClick={() => handleRemoveItem(item.id)} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* BILL SUMMARY */}
          {cartItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Bill Summary
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
                className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                onClick={() => navigate("/check-out")}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;
