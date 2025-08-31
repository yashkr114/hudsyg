const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authorize } = require('../auth');


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'tasks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, XLS, and XLSX files are allowed.'));
    }
  }
});


// GET all tasks
router.get('/tasks', authorize(['admin', 'team']), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT task_id, task_name, task_description, task_link, task_duration, documents, created_at
      FROM task_table
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new task
router.post('/tasks', authorize(['admin', 'team']), (req, res, next) => upload.array('documents', 5)(req, res, next), async (req, res) => {
  const { task_name, task_description, task_link, task_duration } = req.body;
  if (!task_name || !task_description || !task_duration) {
    return res.status(400).json({ error: 'Task name, description, and duration are required' });
  }
  try {
    const documents = req.files ? req.files.map(file => file.filename) : [];
    const { rows } = await pool.query(`
      INSERT INTO task_table (task_name, task_description, task_link, task_duration, documents)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING task_id, task_name, task_description, task_link, task_duration, documents, created_at
    `, [task_name, task_description, task_link || null, parseInt(task_duration), documents]);
    res.json(rows[0]);
  } catch (err) {
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task
router.put('/tasks/:task_id', authorize(['admin', 'team']), (req, res, next) => upload.array('documents', 5)(req, res, next), async (req, res) => {
  const { task_id } = req.params;
  const { task_name, task_description, task_link, task_duration, existingDocuments } = req.body;
  if (!task_name || !task_description || !task_duration) {
    return res.status(400).json({ error: 'Task name, description, and duration are required' });
  }
  try {
    const keepDocuments = existingDocuments ? JSON.parse(existingDocuments) : [];
    const newDocuments = req.files ? req.files.map(file => file.filename) : [];
    const allDocuments = [...keepDocuments, ...newDocuments];
    const currentTask = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
    const currentDocuments = currentTask.rows[0]?.documents || [];
    const documentsToDelete = currentDocuments.filter(doc => !keepDocuments.includes(doc));
    documentsToDelete.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    const { rows } = await pool.query(
      `
      UPDATE task_table 
      SET task_name = $1, task_description = $2, task_link = $3, task_duration = $4, documents = $5
      WHERE task_id = $6
      RETURNING task_id, task_name, task_description, task_link, task_duration, documents, created_at
    `, [task_name, task_description, task_link || null, parseInt(task_duration), allDocuments, task_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Download documents
router.get('/tasks/:task_id/download/:filename', authorize(['admin', 'team', 'client']), async (req, res) => {
  const { task_id, filename } = req.params;
  try {
    const { rows } = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const documents = rows[0].documents || [];
    if (!documents.includes(filename)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task and associated files
router.delete('/tasks/:task_id', authorize(['admin', 'team']), async (req, res) => {
  const { task_id } = req.params;
  try {
    const { rows: taskRows } = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
    const documents = taskRows[0]?.documents || [];
    const { rows } = await pool.query(
      `DELETE FROM task_table WHERE task_id = $1 RETURNING task_id`,
      [task_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    documents.forEach(filename => {
      const filePath = path.join(uploadsDir, filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    res.json({ success: true, message: 'Task and associated documents deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign tasks to multiple employees
router.post('/assign-tasks', authorize(['admin', 'team']), async (req, res) => {
  const { assignments } = req.body;
  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({ error: 'No assignments provided' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let successCount = 0;
    let duplicateCount = 0;
    for (const assignment of assignments) {
      const { gid_no, task_id, deadline_days_left } = assignment;
      try {
        const { rows: existing } = await client.query(
          'SELECT 1 FROM assigned_tasks WHERE gid_no = $1 AND task_id = $2',
          [gid_no, task_id]
        );
        if (existing.length > 0) {
          duplicateCount++;
          continue;
        }
        await client.query(
          `INSERT INTO assigned_tasks 
           (gid_no, task_id, deadline_days_left, assigned_at, completed_by_emp, completed_by_manager)
           VALUES ($1, $2, $3, NOW(), FALSE, FALSE)`,
          [gid_no, task_id, deadline_days_left]
        );
        successCount++;
      } catch (err) {
        console.error(`Error assigning task ${task_id} to ${gid_no}:`, err);
      }
    }
    await client.query('COMMIT');
    let message = `Successfully assigned ${successCount} tasks.`;
    if (duplicateCount > 0) {
      message += ` ${duplicateCount} assignments were skipped (already assigned).`;
    }
    res.json({ 
      success: true, 
      message,
      successCount,
      duplicateCount,
      totalAttempted: assignments.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in task assignment:', err);
    res.status(500).json({ error: 'Failed to assign tasks. Please try again.' });
  } finally {
    client.release();
  }
});

// Get assigned tasks for a specific employee (for MyTasks component)
router.get('/my-tasks', authorize(['client']), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        at.gid_no,
        at.task_id,
        at.deadline_days_left,
        at.assigned_at,
        at.completed_by_emp,
        at.completed_by_manager,
        t.task_name,
        t.task_description,
        t.task_link,
        t.task_duration,
        t.documents
       FROM assigned_tasks at
       JOIN task_table t ON at.task_id = t.task_id
       WHERE at.gid_no = $1
       ORDER BY at.assigned_at DESC`,
      [req.user.gid_no]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    res.status(500).json({ error: 'Failed to fetch assigned tasks.' });
  }
});

// Get all assigned tasks (for admin/team to review)
router.get('/assigned-tasks', authorize(['admin', 'team']), async (req, res) => {
  try {
    let query = `
      SELECT 
        at.gid_no,
        u.username,
        at.task_id,
        at.deadline_days_left,
        at.assigned_at,
        at.completed_by_emp,
        at.completed_by_manager,
        t.task_name,
        t.task_description,
        t.task_link,
        t.task_duration,
        t.documents
      FROM assigned_tasks at
      JOIN task_table t ON at.task_id = t.task_id
      JOIN users u ON at.gid_no = u.gid_no
    `;
    let params = [];

    // If team, only show tasks for their direct reports (clients)
    if (req.user.role === 'team') {
      query += ` WHERE u.reporting_manager_gid = $1 AND u.role = 'client'`;
      params.push(req.user.gid_no);
    }

    query += ` ORDER BY at.assigned_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching assigned tasks:', err);
    res.status(500).json({ error: 'Failed to fetch assigned tasks.' });
  }
});

// Mark assigned task as completed by employee
router.patch('/assigned-tasks/:gid_no/:task_id/complete', authorize(['client']), async (req, res) => {
  const { gid_no, task_id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE assigned_tasks
       SET completed_by_emp = TRUE
       WHERE gid_no = $1 AND task_id = $2
       RETURNING *`,
      [gid_no, task_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Assigned task not found' });
    }
    res.json({ success: true, task: rows[0] });
  } catch (err) {
    console.error('Error marking task complete:', err);
    res.status(500).json({ error: 'Failed to mark task complete.' });
  }
});

/// Mark assigned task as completed by manager
router.patch('/assigned-tasks/:gid_no/:task_id/approve', authorize(['admin', 'team']), async (req, res) => {
  const { gid_no, task_id } = req.params;
  const { completed_by_manager } = req.body;

  try {
    let query, params;
    if (completed_by_manager === false) {
      // On reject, also reset completed_by_emp and completed_at
      query = `
        UPDATE assigned_tasks
        SET completed_by_manager = $1,
            completed_by_emp = FALSE,
            completed_at = NULL,
            approved_at = NULL
        WHERE gid_no = $2 AND task_id = $3
        RETURNING *`;
      params = [completed_by_manager, gid_no, task_id];
    } else {
      // On approve, only set completed_by_manager and approved_at
      query = `
        UPDATE assigned_tasks
        SET completed_by_manager = $1,
            approved_at = CASE WHEN $1 THEN NOW() ELSE NULL END
        WHERE gid_no = $2 AND task_id = $3
        RETURNING *`;
      params = [completed_by_manager, gid_no, task_id];
    }

    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task assignment not found' });
    }

    res.json({ success: true, assignment: rows[0] });
  } catch (err) {
    console.error('Error approving/rejecting task:', err);
    res.status(500).json({ error: 'Failed to approve/reject task.' });
  }
});
module.exports = {
  router
};
