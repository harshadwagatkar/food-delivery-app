import axios from "axios";
import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaShoppingCart,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { serverURL } from "../App";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";

function Navbar({ searchQuery, setSearchQuery, handleSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.user);

  //userData
  const { userData, city } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  //log out function
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/auth/signout`, {
        withCredentials: true,
      });
      console.log("log out", response.data);
      dispatch(logoutUser());
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="w-full bg-[#fff7f2] shadow-sm px-4 py-3">
      {/* MAIN NAV */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-orange-500">Soez</h1>

          <div className="hidden md:flex items-center gap-1 text-gray-700">
            <FaMapMarkerAlt className="text-orange-500" />
            <span className="font-medium">{city}</span>
          </div>
        </div>

        {/* SEARCH (DESKTOP) */}
        <div className="hidden md:flex flex-1 mx-6">
          <div className="relative w-full">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="search delicious food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-6">
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/cart")}
          >
            <FaShoppingCart className="text-xl" />

            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>

          <span
            className="cursor-pointer font-medium"
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </span>

          {/* PROFILE */}
          <div className="relative">
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
            >
              {userData.fullName.slice(0, 1)}
            </div>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-md py-2 z-50">
                <p className="px-4 py-2 text-sm font-medium">
                  {userData.fullName}
                </p>
                <hr />
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU ICON */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden mt-3">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="search delicious food..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-lg shadow-md p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            <span>{city}</span>
          </div>

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              navigate("/cart");
              setMenuOpen(false);
            }}
          >
            <FaShoppingCart />
            <span>Cart</span>
            {cartItems?.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              navigate("/my-orders");
              setMenuOpen(false);
            }}
          >
            <FaShoppingCart />
            <span>My Orders</span>
          </div>

          <div className="border-t pt-3">
            <p className="font-medium">{userData.fullName}</p>
            <button
              className="text-red-500 mt-2 cursor-pointer"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
