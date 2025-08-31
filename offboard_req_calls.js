const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');
const { sendOffboardRequestToManager, sendOffboardStatusToClient } = require('../mailer');

// 1. Submit Offboard Request (Client)
router.post('/offboard-requests', authorize(['client']), async (req, res) => {
  const client_id = req.user.userId;
  const { username, lanId, accessRevoke, acknowledged } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `DELETE FROM offboard_requests WHERE client_id = $1 AND status = 'pending'`,
      [client_id]
    );

    await client.query(
      `INSERT INTO offboard_requests
        (client_id, username, lan_id, access_revoke, acknowledged)
       VALUES ($1, $2, $3, $4, $5)`,
      [client_id, username, lanId, accessRevoke, acknowledged]
    );

    const userRes = await client.query(
      `SELECT u.username, u.gid_no, u.email, rm.email AS manager_email
       FROM users u
       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
       WHERE u.user_id = $1`,
      [client_id]
    );
    if (userRes.rows.length > 0 && userRes.rows[0].manager_email) {
      const clientInfo = {
        name: userRes.rows[0].username,
        gid: userRes.rows[0].gid_no,
        email: userRes.rows[0].email
      };
      let accessList = Array.isArray(accessRevoke) ? accessRevoke : (accessRevoke ? accessRevoke.split(',') : []);
      await sendOffboardRequestToManager(userRes.rows[0].manager_email, clientInfo, accessList, acknowledged);
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

// 2. Get Pending Offboard Requests (Admin/Team)
router.get('/client-requests', authorize(['admin', 'team']), async (req, res) => {
  try {
    const user = req.user;
    let query = `
      SELECT DISTINCT ON (r.client_id) r.*, u.username as client_username, u.email as client_email, u.gid_no as client_gid
      FROM offboard_requests r
      JOIN users u ON r.client_id = u.user_id
      LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
      WHERE r.status = 'pending'
    `;
    let params = [];

    if (user.role === 'team') {
      query += ` AND u.reporting_manager_gid = $1`;
      params.push(user.gid_no);
    }

    query += ` ORDER BY r.client_id, r.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Accept/Reject Offboard Request (Admin/Team)
router.post('/offboard-requests/:id/decision', authorize(['admin', 'team']), async (req, res) => {
  const { id } = req.params;
  const { decision, notes } = req.body;
  const userId = req.user.userId;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const request = await client.query(
      'SELECT status, client_id FROM offboard_requests WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (request.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Request not found" });
    }
    if (request.rows[0].status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Request already processed" });
    }

    const clientId = request.rows[0].client_id;

    const userRes = await client.query(
      'SELECT gid_no, email, username FROM users WHERE user_id = $1',
      [clientId]
    );
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "User not found" });
    }
    const gid_no = userRes.rows[0].gid_no;
    const clientEmail = userRes.rows[0].email;

    const managerRes = await client.query(
      'SELECT username FROM users WHERE user_id = $1',
      [userId]
    );
    const managerName = managerRes.rows.length > 0 ? managerRes.rows[0].username : 'Manager';

    await client.query(
      `UPDATE offboard_requests
       SET status = $1, decided_by = $2, decided_at = NOW()
       WHERE id = $3`,
      [decision, userId, id]
    );

    if (decision === 'accepted') {
      await client.query(
        `UPDATE offboard_requests SET status = 'removed', decided_at = NOW()
         WHERE client_id = $1 AND status = 'pending' AND id != $2`,
        [clientId, id]
      );
      await client.query('DELETE FROM users WHERE user_id = $1', [clientId]);
    }

    await client.query('COMMIT');
    if (clientEmail) {
      await sendOffboardStatusToClient(clientEmail, decision, managerName, notes);
    }
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
