const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all employee UI boxes
router.get('/employee-ui', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employee_ui ORDER BY task_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new employee UI box
router.post('/employee-ui', async (req, res) => {
  const { task_type, task_name, task_icon, task_subtitle, is_application, application_id } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO employee_ui (task_type, task_name, task_icon, task_subtitle, is_application, application_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [task_type, task_name, task_icon, task_subtitle, is_application, application_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an employee UI box
router.delete('/employee-ui/:task_id', async (req, res) => {
  const { task_id } = req.params;
  try {
    await pool.query('DELETE FROM employee_ui WHERE task_id = $1', [task_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an employee UI box
router.put('/employee-ui/:task_id', async (req, res) => {
  const { task_id } = req.params;
  const { task_type, task_name, task_icon, task_subtitle, is_application, application_id } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE employee_ui
       SET task_type = $1, task_name = $2, task_icon = $3, task_subtitle = $4, is_application = $5, application_id = $6
       WHERE task_id = $7
       RETURNING *`,
      [task_type, task_name, task_icon, task_subtitle, is_application, application_id || null, task_id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get steps for a UI box
router.get('/employee-ui/:task_id/steps', async (req, res) => {
  const { task_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM employee_ui_steps WHERE task_id = $1 ORDER BY step_number`,
      [task_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update all steps for a UI box (replace all steps)
router.put('/employee-ui/:task_id/steps', async (req, res) => {
  const { task_id } = req.params;
  let { steps } = req.body;
  const client = await pool.connect();
  try {
    steps = steps.filter(
      s => s.step_title && s.step_title.trim().length > 0
    );
    await client.query('BEGIN');
    await client.query('DELETE FROM employee_ui_steps WHERE task_id = $1', [task_id]);
    for (const step of steps) {
      await client.query(
        `INSERT INTO employee_ui_steps (task_id, step_number, description)
         VALUES ($1, $2, $3)`,
        [task_id, step.step_number, step.step_title]
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

module.exports = router;
