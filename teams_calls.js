const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');
const { hashPassword } = require('../hash');

// TEAM DASHBOARD DATA
router.get('/team-data', authorize(['team']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
          u.username,
          u.email,
          u.gid_no,
          u.role,
          u.phone,
          rm.username AS reporting_manager_username,
          rm.gid_no AS reporting_manager_gid_no,
          rm.phone AS reporting_manager_phone,
          ARRAY_REMOVE(ARRAY_AGG(a.application_name), NULL) AS application_names
       FROM users u
       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
       LEFT JOIN application a ON ad.application_id = a.application_id
       WHERE u.user_id = $1
       GROUP BY u.user_id, rm.username, rm.gid_no, rm.phone
       LIMIT 1`,
      [req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    const team = rows[0];
    res.json({
      username: team.username,
      email: team.email,
      gid_no: team.gid_no,
      role: team.role,
      phone: team.phone,
      application_names: team.application_names,
      reporting_manager: team.reporting_manager_username
        ? {
            username: team.reporting_manager_username,
            gid_no: team.reporting_manager_gid_no,
            phone: team.reporting_manager_phone
          }
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH team data (email, password, phone)
router.patch('/team-data', authorize(['team']), async (req, res) => {
  const { email, password, phone } = req.body;
  try {
    if (!email || !phone) {
      return res.status(400).json({ error: "Email and phone are required." });
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      await pool.query(
        "UPDATE users SET email = $1, password = $2, phone = $3 WHERE gid_no = $4 AND role = 'team'",
        [email, hashedPassword, phone, req.user.gid_no]
      );
      return res.json({ success: true, passwordChanged: true });
    } else {
      await pool.query(
        "UPDATE users SET email = $1, phone = $2 WHERE gid_no = $3 AND role = 'team'",
        [email, phone, req.user.gid_no]
      );
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// GET clients for all applications a team manager is enrolled in
router.get('/myteam-clients', authorize(['team']), async (req, res) => {
  try {
    const { rows: clients } = await pool.query(
      `SELECT
        u.user_id,
        u.username,
        u.email,
        u.gid_no,
        u.created_at,
        u.active,
        u.phone,
        u.added_by_username,
        u.reporting_manager_gid,
        rm.username AS reporting_manager_username,
        rm.gid_no AS reporting_manager_gid,
        rm.phone AS reporting_manager_phone,
        a.application_name,
        ad.application_id,
        ad.head_application
      FROM users u
      LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
      LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
      LEFT JOIN application a ON ad.application_id = a.application_id
      WHERE u.role = 'client'
        AND u.reporting_manager_gid = $1
      ORDER BY u.username`,
      [req.user.gid_no]
    );
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch my team clients." });
  }
});

module.exports = router;
