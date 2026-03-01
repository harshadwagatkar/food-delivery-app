import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ msg: "User already    exist" });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password is too short" });
    }

    if (mobile.length < 10) {
      return res.status(400).json({ msg: "Please enter valid mobile number" });
    }

    //hashing password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });

    const token = genToken(userData._id);

    //sending token to cookies
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = userData._doc;

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json(`signup error: ${error}`);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const token = genToken(userExist._id);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = userExist._doc;

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ msg: "Sign in failed" });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ msg: "Log out successfully" });
  } catch (error) {
    return res.status(500).json(`sign out error: ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.resetOtp = hashedOtp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();

    await sendOtpEmail(email, otp);
    return res.status(200).json({ msg: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json(`send otp error: ${error}`);
  }
};

export const isVerified = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    const isValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({
      msg: "Verify OTP error",
      error: error.message,
    });
  }
};

// export const isVerified = async (req, res) => {
//     try {
//         const {otp} = req.body
//         const user = await User.findOne({resetOtp:otp})

//         if(!user || user.resetOtp !== otp || user.otpExpires<Date.now()) {
//             return res.status(400).json({msg : "Invalid/Expired OTP"})
//         }

//         user.isOtpVerified = true
//         user.resetOtp = undefined
//         user.otpExpires = undefined
//         await user.save()

//         return res.status(200).json({msg : "OTP verified successfully"})

//     } catch (error) {
//         return res.status(500).json(`Verify otp error: ${error}`)
//     }
// }

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ msg: "OTP verification required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Password too short" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json(`Reset otp error: ${error}`);
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, role, mobile } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      // If no role/mobile provided, this is a sign-in attempt for a non-existent user
      if (!role || !mobile) {
        return res
          .status(400)
          .json({ msg: "User does not exist. Please sign up first." });
      }

      user = await User.create({
        fullName,
        email,
        role,
        mobile,
      });
    }

    const token = genToken(user._id);

    //sending token to cookies
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = user._doc;

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json(`Google auth error: ${error}`);
  }
};
