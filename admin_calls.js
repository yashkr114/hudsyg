const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');
const { hashPassword } = require('../hash');
const { generateRandomPassword } = require('../password');
const { sendAccountEmail, sendTeamOffboardNotification } = require('../mailer');

// ADMIN DASHBOARD DATA
router.get('/admin-data', authorize(['admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT username, email, gid_no, role, phone FROM users WHERE gid_no = $1 AND role = 'admin' LIMIT 1",
      [req.user.gid_no]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin data." });
  }
});

// PATCH admin profile (username, email, password, gid_no, phone)
router.patch('/admin-data', authorize(['admin']), async (req, res) => {
  const { username, email, password, gid_no, phone } = req.body;
  try {
    if (!username || !email || !gid_no || !phone) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      await pool.query(
        "UPDATE users SET username = $1, email = $2, password = $3, gid_no = $4, phone = $5 WHERE user_id = $6 AND role = 'admin'",
        [username, email, hashedPassword, gid_no, phone, req.user.userId]
      );
    } else {
      await pool.query(
        "UPDATE users SET username = $1, email = $2, gid_no = $3, phone = $4 WHERE user_id = $5 AND role = 'admin'",
        [username, email, gid_no, phone, req.user.userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "GID No. already exists. Please use a unique GID No." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// ADD NEW TEAM MEMBER
router.post('/team-members', authorize(['admin']), async (req, res) => {
  const { username, email, gid_no, active, reporting_manager_gid, phone, application_ids } = req.body;
  try {
    const { rows: existing } = await pool.query(
      "SELECT * FROM users WHERE gid_no = $1",
      [gid_no]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "GID No. already exists" });
    }
    const password = generateRandomPassword(10);
    const hashedPassword = await hashPassword(password);
    await pool.query(
      "INSERT INTO users (username, password, email, gid_no, role, active, reporting_manager_gid, phone) VALUES ($1, $2, $3, $4, 'team', $5, $6, $7)",
      [username, hashedPassword, email, gid_no, active, reporting_manager_gid, phone]
    );
    if (Array.isArray(application_ids)) {
      for (const appId of application_ids) {
        await pool.query(
          "INSERT INTO application_details (application_id, gid_no) VALUES ($1, $2)",
          [appId, gid_no]
        );
      }
    }
    await sendAccountEmail(email, username, password, gid_no);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USER STATUS TOGGLE (Team Members)
router.patch('/team-members/:id/active', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  try {
    await pool.query(
      "UPDATE users SET active = $1 WHERE user_id = $2 AND role = 'team'",
      [active, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE TEAM MEMBER (with email notification and CASCADE delete)
router.delete('/team-members/:id', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: memberRows } = await client.query(
      `SELECT u.gid_no, u.username, u.email, u.role 
       FROM users u 
       WHERE u.user_id = $1 AND u.role = 'team'`,
      [id]
    );
    if (memberRows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Team member not found" });
    }
    const teamMember = memberRows[0];
    const { rows: adminRows } = await client.query(
      `SELECT username FROM users WHERE user_id = $1 AND role = 'admin'`,
      [req.user.userId]
    );
    const adminName = adminRows.length > 0 ? adminRows[0].username : 'System Administrator';
    await client.query("DELETE FROM users WHERE user_id = $1 AND role = 'team'", [id]);
    await client.query('COMMIT');
    try {
      if (teamMember.email) {
        await sendTeamOffboardNotification(
          teamMember.email,
          teamMember.username,
          teamMember.gid_no,
          adminName
        );
        console.log(`Offboarding email sent to ${teamMember.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send offboarding email:', emailError);
    }
    res.json({ 
      success: true, 
      message: 'Team member deleted successfully',
      emailSent: !!teamMember.email 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete team member error:', err);
    res.status(500).json({ error: "Failed to delete team member." });
  } finally {
    client.release();
  }
});

// PATCH team member info
router.patch('/team-members/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, reporting_manager_gid, application_ids, gid_no } = req.body;
  try {
    await pool.query(
      `UPDATE users
         SET username = $1,
             email = $2,
             phone = $3,
             reporting_manager_gid = $4
       WHERE user_id = $5 AND role = 'team'`,
      [username, email, phone, reporting_manager_gid, id]
    );
    if (Array.isArray(application_ids) && gid_no) {
      await pool.query(
        `DELETE FROM application_details WHERE gid_no = $1`,
        [gid_no]
      );
      for (const appId of application_ids) {
        await pool.query(
          `INSERT INTO application_details (application_id, gid_no)
           VALUES ($1, $2)
           ON CONFLICT (application_id, gid_no) DO NOTHING`,
          [appId, gid_no]
        );
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update team member." });
  }
});

// Promote/Demote a user (admin only)
router.patch('/promote-user/:id', authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["client", "team", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    await pool.query(
      "UPDATE users SET role = $1 WHERE user_id = $2",
      [role, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role." });
  }
});

// get all users (admin only)
router.get('/all-users', authorize(['admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT user_id, username, gid_no, role FROM users ORDER BY username`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

module.exports = router;
