// routes/auth.js
import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
const router = express.Router();
import {User} from '../models/user.model.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import sendResetEmail from '../utils/sendEmail.js';
// ROUTE 1: Request a reset link
router.post('/forgot-password', async (req, res) => {
    console.log("Forgot password request received:", req.body); // Log the incoming request body
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        console.log("User found for email:", email); // Log if user is found
      await PasswordResetToken.deleteMany({ userId: user._id, used: false });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${email}`;
      await sendResetEmail(user.email, resetLink);
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ROUTE 2: Actually reset the password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User with this EMAIL doesnt Exist' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({
      userId: user._id,
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = newPassword; // ✅ just assign plain text — pre-save hook hashes it
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
