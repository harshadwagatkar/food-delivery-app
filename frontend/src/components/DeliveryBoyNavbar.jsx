import React, { useEffect, useRef, useState } from "react";
import { FiShoppingBag, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import { logoutUser } from "../redux/userSlice";

function DeliveryBoyNavbar({ orderCount = 0 }) {
  const { userData } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    // console.log(user)
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // logout
  const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(logoutUser());
      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* LOGO */}
        <h1 className="text-2xl font-extrabold text-orange-600 tracking-wide" onClick={() => navigate("/")}>
          Soez
        </h1>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-5 relative">

          {/* MY ORDERS */}
          <button
            onClick={() => navigate("/delivered-orders")}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
          >
            <FiShoppingBag />
            My Orders
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {orderCount}
              </span>
            )} 
          </button>

          {/* PROFILE */}
          <div className="relative" ref={popupRef}>
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-10 h-10 cursor-pointer flex items-center justify-center rounded-full bg-orange-500 text-white font-semibold shadow"
            >
              {userData?.fullName?.charAt(0).toUpperCase() || "D"}
            </div>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {userData?.fullName || "Delivery Boy"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userData?.mobile}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition rounded-b-xl"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default DeliveryBoyNavbar;
