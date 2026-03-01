import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from 'react-redux';


const COLORS = {
  primary: "#F94A29", // orange-red
  primaryDark: "#E63E20",
  bg: "#FFF7F3",
  border: "#E5E7EB",
  text: "#1F2937",
  muted: "#6B7280",
};

export default function SignUp() {
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);

  const roles = ["user", "owner", "deliveryBoy"];

  //Get form details for backend
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
  });
  const navigate = useNavigate()

  const dispatch =  useDispatch()

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${serverURL}/api/auth/signup`, user, {
        withCredentials : true
      });

      toast.success("Signup successful 🎉");
      dispatch(setUserData(response.data))
      // console.log("Signup Success:", response.data);
      navigate("/")
    } catch (error) {
      toast.error(error.response?.data?.msg || "Signup failed");
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    if (!user.mobile || user.mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    if (!user.role) {
      toast.error("Please select a role");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;

      const response = await axios.post(
        `${serverURL}/api/auth/google-auth`,
        {
          fullName: firebaseUser.displayName,
          email: firebaseUser.email,
          role,
          mobile: user.mobile,
        },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      toast.success("Google signup successful 🚀");
      dispatch(setUserData(response.data))
      navigate("/")
      console.log("Google signup successfully:", response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Google signup failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="w-[360px] bg-white rounded-xl shadow-lg px-6 py-5">
        {/* Header */}
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: COLORS.primary }}
        >
          Soez
        </h1>
        <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
          Create your account to get started with delicious food deliveries
        </p>

        {/* Form */}
        <form className="space-y-4" action="" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={user.fullName}
              placeholder="Enter your Full Name"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.border }}
              onChange={handleInput}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              placeholder="Enter your Email"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.border }}
              onChange={handleInput}
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-sm font-medium">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={user.mobile}
              placeholder="Enter your Mobile Number"
              className="w-full mt-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{ borderColor: COLORS.border }}
              onChange={handleInput}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                placeholder="Enter your password"
                className="w-full mt-1 px-3 py-2 pr-10 rounded-md border focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.border }}
                onChange={handleInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium block mb-2">Role</label>
            <div className="flex gap-3">
              {roles.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setUser((prev) => ({ ...prev, role: r }));
                  }}
                  className="flex-1 py-2 rounded-md border text-sm font-medium capitalize transition"
                  style={
                    role === r
                      ? {
                          backgroundColor: COLORS.primary,
                          color: "white",
                          borderColor: COLORS.primary,
                        }
                      : {
                          backgroundColor: "white",
                          color: COLORS.primary,
                          borderColor: COLORS.primary,
                        }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-md text-white font-semibold transition"
            style={{ backgroundColor: COLORS.primary }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.primaryDark)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = COLORS.primary)
            }
          >
            Sign Up
          </button>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full mt-3 flex items-center justify-center gap-2 border rounded-md py-2 text-sm font-medium hover:bg-gray-50 transition"
          >
            <FcGoogle className="text-xl" />
            Sign up with Google
          </button>

          {/* Sign in link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="font-medium text-[#F94A29] hover:underline"
            >
              signin
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
