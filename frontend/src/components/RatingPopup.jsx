import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

function RatingPopup({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      
      {/* POPUP */}
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl animate-scaleIn">
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Rate this food ⭐
        </h3>

        {/* STARS */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={28}
              className={`cursor-pointer transition ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2 rounded-full border text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            disabled={rating === 0}
            onClick={() => onSubmit(rating)}
            className="w-1/2 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default RatingPopup;
