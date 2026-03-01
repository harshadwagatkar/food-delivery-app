import axios from "axios";
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";

const COLORS = {
  primary: "#F94A29",
  primaryDark: "#E63E20",
  bg: "#FFF7F3",
  border: "#E5E7EB",
  muted: "#6B7280",
};

export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | otp / reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/auth/send-otp`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(response.data.msg || "OTP sent successfully 📩");
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/auth/verify-otp`,
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(response.data.msg || "OTP verified ✅");
      setStep("reset");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/auth/reset-password`,
        { email, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(response.data.msg || "Password updated successfully 🔒");
      navigate("/signin");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: COLORS.bg }}
    >
      <div className="w-[360px] bg-white rounded-xl shadow-lg px-6 py-6">
        {/* Header */}
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: COLORS.primary }}
        >
          Forgot Password
        </h1>
        <p className="text-sm mb-6" style={{ color: COLORS.muted }}>
          {step === "email" && "Enter your email to receive an OTP"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "reset" && "Set a new password"}
        </p>

        {/* STEP 1: EMAIL */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                className="w-full mt-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.border }}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: loading ? "#ccc" : COLORS.primary,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <Oval
                  height={20}
                  width={20}
                  color="#fff"
                  secondaryColor="#fff"
                />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-sm font-medium">OTP</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                placeholder="Enter OTP"
                className="w-full mt-1 px-3 py-2 text-center tracking-widest text-lg rounded-md border focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.border }}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: loading ? "#ccc" : COLORS.primary,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <Oval
                  height={20}
                  width={20}
                  color="#fff"
                  secondaryColor="#fff"
                />
              ) : (
                "Verify OTP"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Didn’t receive OTP?{" "}
              <button
                type="button"
                onClick={() => console.log("Resend OTP")}
                className="font-medium text-[#F94A29] hover:underline"
              >
                Resend
              </button>
            </p>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full mt-1 px-3 py-2 rounded-md border bg-gray-100 cursor-not-allowed"
                style={{ borderColor: COLORS.border }}
              />
            </div>

            <div>
              <label className="text-sm font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                placeholder="Enter new password"
                className="w-full mt-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{ borderColor: COLORS.border }}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-semibold flex items-center justify-center"
              style={{
                backgroundColor: loading ? "#ccc" : COLORS.primary,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <Oval
                  height={20}
                  width={20}
                  color="#fff"
                  secondaryColor="#fff"
                />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        {/* Back to signin */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Back to{" "}
          <Link
            to="/signin"
            className="font-medium text-[#F94A29] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
