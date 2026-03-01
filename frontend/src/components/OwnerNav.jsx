import React, { useEffect, useRef, useState } from "react";
import { FiPlus, FiShoppingBag, FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/userSlice";
import axios from "axios";
import { serverURL } from "../App";
import { logoutOwner } from "../redux/ownerSlice";

function OwnerNav({ showActions = false }) {
  const { shopData } = useSelector((state) => state.owner);
  const { myOrders } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  // close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //log out function===============>
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${serverURL}/api/auth/signout`, {
        withCredentials: true,
      });
      console.log(response.data);
      dispatch(logoutOwner());
      dispatch(logoutUser());
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-4">
        {/* Logo */}
        <h2 className="text-2xl font-extrabold text-[#ff5a3c] tracking-wide">
          Soez
        </h2>

        {/* Actions */}
        <div className="flex items-center gap-6 mt-3 md:mt-0 text-[#ff5a3c] font-medium relative">
          {showActions && (
            <>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-[#fff1ec] transition"
                onClick={() => navigate("/add-item")}
              >
                <FiPlus /> Add Food Item
              </button>

              <button
                className="relative flex items-center gap-1 px-3 py-1 rounded-md hover:bg-[#fff1ec] transition"
                onClick={() => navigate("/my-orders")}
              >
                <FiShoppingBag />
                My Orders
                {myOrders.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {myOrders.length}
                  </span>
                )}
              </button>
            </>
          )}

          {/* Profile */}
          <div className="relative" ref={popupRef}>
            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-9 h-9 cursor-pointer flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff5a3c] to-[#ff784e] text-white font-semibold shadow"
            >
              {shopData ? shopData.name.slice(0, 1).toUpperCase() : "A"}
            </div>

            {/* Popup */}
            {open && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {shopData?.name || "Owner"}
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

export default OwnerNav;
