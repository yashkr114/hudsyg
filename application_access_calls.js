const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all access types
router.get('/access', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT access_id, access_name, duration_in_days, is_application, application_id FROM access ORDER BY access_id"
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch access types." });
  }
});

// GET ALL APPLICATIONS (for Application Management)
router.get("/applications", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT application_id, application_name FROM application ORDER BY application_id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// Add a new access type (with duplicate check)
router.post('/access', async (req, res) => {
  const { access_name, duration_in_days, is_application, application_id } = req.body;
  if (!access_name || !access_name.trim()) {
    return res.status(400).json({ error: "Access name is required." });
  }
  try {
    const { rows } = await pool.query(
      "SELECT 1 FROM access WHERE LOWER(access_name) = LOWER($1)",
      [access_name.trim()]
    );
    if (rows.length > 0) {
      return res.status(409).json({ error: "Access name already exists. Please choose a different name." });
    }
    const insert = await pool.query(
      "INSERT INTO access (access_name, duration_in_days, is_application, application_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [access_name.trim(), duration_in_days || 0, is_application || false, is_application ? application_id : null]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add access." });
  }
});

// Delete an access type
router.delete('/access/:access_id', async (req, res) => {
  const { access_id } = req.params;
  try {
    await pool.query("DELETE FROM user_access WHERE access_id = $1", [access_id]);
    await pool.query("DELETE FROM access WHERE access_id = $1", [access_id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete access." });
  }
});

// Update an access type
router.patch('/access/:access_id', async (req, res) => {
  const { access_id } = req.params;
  const { access_name, duration_in_days, is_application, application_id } = req.body;
  if (!access_name || !access_name.trim()) {
    return res.status(400).json({ error: "Access name is required." });
  }
  try {
    const { rows: existing } = await pool.query(
      "SELECT 1 FROM access WHERE LOWER(access_name) = LOWER($1) AND access_id != $2",
      [access_name.trim(), access_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Access name already exists. Please choose a different name." });
    }
    const { rows } = await pool.query(
      `UPDATE access 
       SET access_name = $1, duration_in_days = $2, is_application = $3, application_id = $4
       WHERE access_id = $5
       RETURNING *`,
      [
        access_name.trim(), 
        duration_in_days || 0, 
        is_application || false, 
        is_application ? application_id : null, 
        access_id
      ]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Access type not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating access:', err);
    res.status(500).json({ error: "Failed to update access type." });
  }
});

// PUT /api/user-access/:gid_no
router.put('/user-access/:gid_no', async (req, res) => {
  const { gid_no } = req.params;
  const { access_ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM user_access WHERE gid_no = $1", [gid_no]);
    for (const access_id of access_ids) {
      await client.query(
        "INSERT INTO user_access (gid_no, access_id) VALUES ($1, $2)",
        [gid_no, access_id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to update access." });
  } finally {
    client.release();
  }
});

// Get team members enrolled in a specific application
router.get('/applications/:application_id/team-members', async (req, res) => {
  const { application_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT u.gid_no, u.username
         FROM application_details ad
         JOIN users u ON ad.gid_no = u.gid_no
        WHERE ad.application_id = $1 AND u.role = 'team'`,
      [application_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team members for application." });
  }
});

// POST a new application (with duplicate name check)
router.post("/applications", async (req, res) => {
  const { application_name } = req.body;
  if (!application_name || !application_name.trim()) {
    return res.status(400).json({ error: "Application name is required." });
  }
  try {
    const { rows } = await pool.query(
      "SELECT 1 FROM application WHERE LOWER(application_name) = LOWER($1)",
      [application_name.trim()]
    );
    if (rows.length > 0) {
      return res.status(409).json({ error: "Application name already exists. Please choose a different name." });
    }
    const insert = await pool.query(
      "INSERT INTO application (application_name) VALUES ($1) RETURNING application_id, application_name",
      [application_name.trim()]
    );
    res.status(201).json(insert.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Application name already exists. Please choose a different name." });
    }
    res.status(500).json({ error: "Failed to add application." });
  }
});

router.get("/applications-with-head", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        a.application_id,
        a.application_name,
        ad.gid_no,
        u.username AS head_username
      FROM application a
      LEFT JOIN application_details ad
        ON a.application_id = ad.application_id AND ad.head_application = TRUE
      LEFT JOIN users u
        ON ad.gid_no = u.gid_no
      ORDER BY a.application_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// DELETE an application
router.delete("/applications/:application_id", async (req, res) => {
  const { application_id } = req.params;
  try {
    await pool.query("DELETE FROM application_details WHERE application_id = $1", [application_id]);
    await pool.query("DELETE FROM application WHERE application_id = $1", [application_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application." });
  }
});

router.put("/applications/:application_id/head", async (req, res) => {
  const { application_id } = req.params;
  const { gid_no } = req.body;
  if (!gid_no) {
    return res.status(400).json({ error: "gid_no is required." });
  }
  try {
    await pool.query(
      "UPDATE application_details SET head_application = FALSE WHERE application_id = $1",
      [application_id]
    );
    await pool.query(
      `INSERT INTO application_details (application_id, gid_no, head_application)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (application_id, gid_no)
       DO UPDATE SET head_application = EXCLUDED.head_application`,
      [application_id, gid_no]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update application head." });
  }
});

// GET all access types assigned to a user (by gid_no)
router.get('/user-access/:gid_no', async (req, res) => {
  const { gid_no } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT a.access_id, a.access_name
         FROM user_access ua
         JOIN access a ON ua.access_id = a.access_id
        WHERE ua.gid_no = $1
        ORDER BY a.access_name`,
      [gid_no]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user access." });
  }
});

module.exports = router;
