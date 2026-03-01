import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaReceipt } from "react-icons/fa";

function OrderPlaced() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-300 rounded-full opacity-20"></div>
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-400 rounded-full opacity-20"></div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center relative z-10">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Order Placed Successfully!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-500 mt-3 text-sm md:text-base">
          Thank you for your order. Your delicious food is being prepared and
          will be delivered soon 🍔🍕
        </p>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Info */}
        <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-600">
          You can track your order status and view details anytime from
          <span className="font-semibold text-gray-800"> My Orders</span>.
        </div>

        {/* Button */}
        <button
          onClick={() => navigate("/my-orders")}
          className="mt-8 w-full flex items-center justify-center gap-3 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md hover:shadow-lg"
        >
          <FaReceipt />
          Go to My Orders
        </button>
      </div>
    </div>
  );
}

export default OrderPlaced;
