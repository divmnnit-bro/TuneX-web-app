import "dotenv/config";
import sendResetEmail from "./src/utils/sendEmail.js"; // adjust path to match your actual file location

sendResetEmail(
  "streamx333@gmail.com", // any real email you can check — can even be the same Gmail account
  "http://localhost:3000/reset-password?token=test123"
)
  .then(() => console.log("✅ Email sent successfully!"))
  .catch((err) => console.error("❌ Failed to send:", err));