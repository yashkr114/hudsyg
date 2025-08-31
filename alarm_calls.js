const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');

// Get all alarms (for admin view)
router.get('/all-alarms', authorize(['admin']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        aa.gid_no,
        aa.access_id,
        aa.deadline_date,
        a.access_name,
        u.username,
        u.email
       FROM access_alarm aa
       JOIN access a ON aa.access_id = a.access_id
       JOIN users u ON aa.gid_no = u.gid_no
       LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
       WHERE ua.access_id IS NULL
       ORDER BY aa.deadline_date ASC, u.username`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get alarms for a client
router.get('/alarms', authorize(['client']), async (req, res) => {
  try {
    const gid_no = req.user.gid_no;

    // Pending access alarms (not yet granted)
    const { rows: accessAlarms } = await pool.query(
      `SELECT 
        aa.access_id,
        aa.deadline_date,
        a.access_name,
        'access' AS alarm_type
       FROM access_alarm aa
       JOIN access a ON aa.access_id = a.access_id
       LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
       WHERE aa.gid_no = $1
         AND ua.access_id IS NULL
       ORDER BY aa.deadline_date ASC`,
      [gid_no]
    );

    // Pending offboard requests
    const { rows: offboardAlarms } = await pool.query(
      `SELECT 
        NULL AS access_id,
        r.created_at AS deadline_date,
        'Offboard Request Pending' AS access_name,
        'offboard' AS alarm_type
       FROM offboard_requests r
       WHERE r.client_id = (
         SELECT user_id FROM users WHERE gid_no = $1
       ) AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [gid_no]
    );

    // Combine both types
    const allAlarms = [...accessAlarms, ...offboardAlarms];

    res.json(allAlarms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all pending alarms for employees reporting to the logged-in team manager
// ...existing code...
router.get('/team-alarms', authorize(['team']), async (req, res) => {
  try {
    const managerGid = req.user.gid_no;
    const { rows } = await pool.query(
      `SELECT 
        u.username AS client_name,
        u.gid_no AS client_gid,
        aa.access_id,
        aa.deadline_date,
        a.access_name
       FROM access_alarm aa
       JOIN access a ON aa.access_id = a.access_id
       JOIN users u ON aa.gid_no = u.gid_no
       LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
       WHERE u.reporting_manager_gid = $1
         AND ua.access_id IS NULL
       ORDER BY aa.deadline_date ASC`,
      [managerGid]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ...existing code...

module.exports = router;
