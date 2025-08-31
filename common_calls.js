const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');
const { generateRandomPassword } = require('../password');
const { sendAccountEmail } = require('../mailer');
const { hashPassword, comparePassword } = require('../hash');

// GET all team members with their application enrollment and head status
router.get('/team-members', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.gid_no,
        u.role,
        u.created_at,
        u.active,
        u.phone,
        rm.username AS reporting_manager_username,
        u.reporting_manager_gid,
        rm.phone AS reporting_manager_phone,
        ARRAY_REMOVE(ARRAY_AGG(ad.application_id), NULL) AS application_ids,
        ARRAY_REMOVE(ARRAY_AGG(a.application_name), NULL) AS application_names,
        BOOL_OR(ad.head_application) AS head_application
      FROM users u
      LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
      LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
      LEFT JOIN application a ON ad.application_id = a.application_id
      WHERE u.role IN ('team', 'admin') AND u.active = TRUE
      GROUP BY u.user_id, rm.username, rm.phone
      ORDER BY 
        CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
        u.username
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team members." });
  }
});

// GET all client members with their application enrollment and head status
router.get('/client-members', async (req, res) => {
  try {
    const { rows: clients } = await pool.query(`
      SELECT
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
      ORDER BY u.username
    `);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client members." });
  }
});

// Helper: Create alarms for all relevant access types for a user
async function createAllAccessAlarmsForUser(gid_no, application_id) {
  const { rows: accesses } = await pool.query(
    `SELECT access_id, duration_in_days FROM access
     WHERE is_application = false OR (is_application = true AND application_id = $1)`,
    [application_id]
  );
  for (const access of accesses) {
    await pool.query(
      `INSERT INTO access_alarm (gid_no, access_id, deadline_date)
       VALUES ($1, $2, CURRENT_DATE + ($3 || ' days')::interval)
       ON CONFLICT (gid_no, access_id) DO NOTHING`,
      [gid_no, access.access_id, access.duration_in_days]
    );
  }
}

// ADD NEW CLIENT MEMBER (with GID validation, random password, and email)
router.post('/client-members', authorize(['admin', 'team']), async (req, res) => {
  const { username, email, gid_no, active, reporting_manager_gid, phone, application_id } = req.body;
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
      "INSERT INTO users (username, password, email, gid_no, role, active, reporting_manager_gid, phone) VALUES ($1, $2, $3, $4, 'client', $5, $6, $7)",
      [username, hashedPassword, email, gid_no, active, reporting_manager_gid, phone]
    );
    if (application_id) {
      await pool.query(
        "INSERT INTO application_details (application_id, gid_no) VALUES ($1, $2)",
        [application_id, gid_no]
      );
    }
    await createAllAccessAlarmsForUser(gid_no, application_id);
    await sendAccountEmail(email, username, password, gid_no);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH client member info (including application)
router.patch('/client-members/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, reporting_manager_gid, application_id, gid_no } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE users
         SET username = $1,
             email = $2,
             phone = $3,
             reporting_manager_gid = $4
       WHERE user_id = $5 AND role = 'client'`,
      [username, email, phone, reporting_manager_gid, id]
    );
    if (application_id && gid_no) {
      await client.query(
        `DELETE FROM application_details WHERE gid_no = $1`,
        [gid_no]
      );
      await client.query(
        `INSERT INTO application_details (application_id, gid_no)
         VALUES ($1, $2)
         ON CONFLICT (application_id, gid_no) DO NOTHING`,
        [application_id, gid_no]
      );
    }
    try {
      await client.query(
        `DELETE FROM user_access
         WHERE gid_no = $1
           AND access_id IN (
             SELECT access_id FROM access
             WHERE is_application = true
           )`,
        [gid_no]
      );
    } catch (err) {
      console.error('Error deleting from user_access:', err.message);
    }
    await client.query(
      `DELETE FROM access_alarm
       WHERE gid_no = $1
         AND access_id IN (
           SELECT access_id FROM access WHERE is_application = true
         )`,
      [gid_no]
    );
    const { rows: accesses } = await client.query(
      `SELECT access_id, duration_in_days FROM access
       WHERE is_application = false OR (is_application = true AND application_id = $1)`,
      [application_id]
    );
    for (const access of accesses) {
      await client.query(
        `INSERT INTO access_alarm (gid_no, access_id, deadline_date)
         VALUES ($1, $2, CURRENT_DATE + ($3 || ' days')::interval)
         ON CONFLICT (gid_no, access_id) DO NOTHING`,
        [gid_no, access.access_id, access.duration_in_days]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// USER STATUS TOGGLE (Clients)
router.patch('/client-members/:id/active', authorize(['admin', 'team']), async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  try {
    await pool.query(
      "UPDATE users SET active = $1 WHERE user_id = $2 AND role = 'client'",
      [active, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE client member
router.delete('/client-members/:id', authorize(['admin', 'team']), async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT gid_no FROM users WHERE user_id = $1 AND role = 'client'",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Client not found" });
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete client error:", err);
    res.status(500).json({ error: "Failed to delete client." });
  }
});

// CLIENT DASHBOARD DATA (with reporting manager info)
router.get('/client-data', authorize(['client']), async (req, res) => {  
  try {
    const { rows } = await pool.query(
      `SELECT 
          u.username, u.email, u.gid_no, u.phone,
          a.application_name,
          ad.application_id,
          rm.username AS reporting_manager_username,
          rm.gid_no AS reporting_manager_gid_no,
          rm.phone AS reporting_manager_phone
       FROM users u
       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
       LEFT JOIN application a ON ad.application_id = a.application_id
       WHERE u.user_id = $1
       LIMIT 1`,
      [req.user.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Client not found" });
    const client = rows[0];
    res.json({
      username: client.username,
      email: client.email,
      gid_no: client.gid_no,
      phone: client.phone,
      application_name: client.application_name,
      application_id: client.application_id,
      reporting_manager: client.reporting_manager_username
        ? {
            username: client.reporting_manager_username,
            gid_no: client.reporting_manager_gid_no,
            phone: client.reporting_manager_phone
          }
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHANGE PASSWORD ENDPOINT (for client, team, admin) ---
router.patch('/change-password', authorize(['client']), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const gid_no = req.user.gid_no;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password required." });
  }
  try {
    const { rows } = await pool.query(
      "SELECT password FROM users WHERE gid_no = $1",
      [gid_no]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    const match = await comparePassword(currentPassword, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }
    const hashed = await hashPassword(newPassword);
    await pool.query(
      "UPDATE users SET password = $1 WHERE gid_no = $2",
      [hashed, gid_no]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
});

module.exports = router;

