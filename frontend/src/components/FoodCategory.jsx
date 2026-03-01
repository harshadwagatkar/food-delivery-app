import React, { useRef } from "react";
import { categories } from "../category";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function FoodCategory({onSelectCategory}) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    }); 
  };

  return (
    <div className="w-full bg-[#fff7f2] py-4 relative">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER */}
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
          Explore Categories
        </h2>

        {/* LEFT BUTTON */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex items-center justify-center absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md w-9 h-9 rounded-full hover:bg-orange-100 transition"
        >
          <FaChevronLeft className="text-orange-500" />
        </button>

        {/* CATEGORY LIST */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {categories.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelectCategory(item.category)}
              className="min-w-[120px] md:min-w-[150px] bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <div className="w-full h-24 md:h-28 overflow-hidden rounded-t-xl">
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>

              <div className="py-2 text-center">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={scrollRight}
          className="hidden md:flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md w-9 h-9 rounded-full hover:bg-orange-100 transition"
        >
          <FaChevronRight className="text-orange-500" />
        </button>
      </div>
    </div>
  );
}

export default FoodCategory;
