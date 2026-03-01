import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  }); 

  await transporter.sendMail({
    from: `"Soez" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <h2>Your OTP</h2>
      <p>Your OTP to reset password is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
};



export const sendDeliveryOtpMail = async(email, otp) => {
  const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
      user : process.env.EMAIL_USER,
      pass : process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    from : `"Soez" <${process.env.EMAIL_USER}>`,
    to : email,
    subject : "Password Reset OTP",
    html : `
    <h2>Your OTP </h2>
    <p>Your OTP for order is : </P>
    <h1>${otp}</h1>
    <p>This OTP is valid for 5 minutes.</p>
    `,
  });
}
