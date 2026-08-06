import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendResetEmail = async (to, resetLink) => {
  console.log("Sending from:", process.env.GMAIL_USER); // sanity check env is loaded
  console.log("Sending to:", to);

  const info = await transporter.sendMail({
    from: `"TuneX" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
  });

  console.log("Message ID:", info.messageId);
  console.log("Response:", info.response);
  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);

  return info;
};

export default sendResetEmail;