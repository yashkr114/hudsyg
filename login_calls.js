const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { comparePassword, hashPassword } = require('../hash');
const { sendOtpEmail } = require('../mailer');

// --- FORGOT PASSWORD FLOW ---
const otpStore = new Map(); // In-memory store: { gid_no: { otp, expires, user_id, email } }

// --- OTP GENERATION UTILITY ---
function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

// -----LOGIN by GID No.-----
router.post('/login', async (req, res) => {
  const { gid_no, password } = req.body;
  try {
    const { rows: users } = await pool.query(
      `SELECT user_id, username, email, gid_no, role, reporting_manager_gid, password as password_hash 
       FROM users WHERE gid_no = $1 AND active = TRUE`,
      [gid_no]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        gid_no: user.gid_no,
        role: user.role,
        reporting_manager_gid: user.reporting_manager_gid
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, role: user.role, userId: user.user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Request OTP
router.post('/request-password-reset', async (req, res) => {
  const { gid_no } = req.body;
  if (!gid_no) return res.status(400).json({ error: 'GID No. required' });
  const { rows } = await pool.query('SELECT user_id, email, username, gid_no FROM users WHERE gid_no = $1', [gid_no]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  const user = rows[0];
  const otp = generateOTP(6);
  const expires = Date.now() + 10 * 60 * 1000; // 10 min
  otpStore.set(gid_no, { otp, expires, user_id: user.user_id, email: user.email });
  await sendOtpEmail(user.email, user.username, otp, user.gid_no);
  res.json({ success: true });
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { gid_no, otp } = req.body;
  const entry = otpStore.get(gid_no);
  if (!entry) return res.status(400).json({ error: 'No OTP requested for this GID' });
  if (Date.now() > entry.expires) return res.status(400).json({ error: 'OTP expired' });
  if (entry.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
  res.json({ success: true });
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  const { gid_no, otp, newPassword } = req.body;
  const entry = otpStore.get(gid_no);
  if (!entry || entry.otp !== otp || Date.now() > entry.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }
  const hashed = await hashPassword(newPassword);
  await pool.query('UPDATE users SET password = $1 WHERE gid_no = $2', [hashed, gid_no]);
  otpStore.delete(gid_no);
  res.json({ success: true });
});

module.exports = router;
