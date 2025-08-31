const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { comparePassword } = require('./hash');
const { generateRandomPassword } = require('./password');
const { 
  sendAccountEmail, 
  sendOtpEmail, 
  sendOffboardRequestToManager, 
  sendOffboardStatusToClient,
  sendTeamOffboardNotification 
} = require('./mailer');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const { authorize } = require('./auth');

app.use(cors());
app.use(express.json());

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, 'uploads', 'tasks');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.includes(ext)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, XLS, and XLSX files are allowed.'));
//     }
//   }
// });



const loginCalls = require('./login_calls/login_calls');
app.use('/api', loginCalls);

// /////////////////////////////////////////
// // ===== Authentication Page =====

// // -----LOGIN by GID No.-----
// app.post('/api/login', async (req, res) => {
//   const { gid_no, password } = req.body;
//   try {
//     // Get user by gid_no only
//     const { rows: users } = await pool.query(
//       `SELECT user_id, username, email, gid_no, role, reporting_manager_gid, password as password_hash 
//        FROM users WHERE gid_no = $1 AND active = TRUE`,
//       [gid_no]
//     );
//     if (users.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
//     const user = users[0];
//     // Compare password with hash
//     const match = await comparePassword(password, user.password_hash);
//     if (!match) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
//     const token = jwt.sign(
//       {
//         userId: user.user_id,
//         username: user.username,
//         email: user.email,
//         gid_no: user.gid_no,
//         role: user.role,
//         reporting_manager_gid: user.reporting_manager_gid
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );
//     res.json({ token, role: user.role, userId: user.user_id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // --- FORGOT PASSWORD FLOW ---
// const otpStore = new Map(); // In-memory store: { gid_no: { otp, expires, user_id, email } }

// // --- OTP GENERATION UTILITY ---
// function generateOTP(length = 6) {
//   let otp = '';
//   for (let i = 0; i < length; i++) {
//     otp += Math.floor(Math.random() * 10).toString();
//   }
//   return otp;
// }

// // 1. Request OTP
// app.post('/api/request-password-reset', async (req, res) => {
//   const { gid_no } = req.body;
//   if (!gid_no) return res.status(400).json({ error: 'GID No. required' });
//   const { rows } = await pool.query('SELECT user_id, email, username, gid_no FROM users WHERE gid_no = $1', [gid_no]);
//   if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
//   const user = rows[0];
//   const otp = generateOTP(6);
//   const expires = Date.now() + 10 * 60 * 1000; // 10 min
//   otpStore.set(gid_no, { otp, expires, user_id: user.user_id, email: user.email });
//   // Send OTP email
//   await sendOtpEmail(user.email, user.username, otp, user.gid_no);
//   res.json({ success: true });
// });

// // 2. Verify OTP
// app.post('/api/verify-otp', async (req, res) => {
//   const { gid_no, otp } = req.body;
//   const entry = otpStore.get(gid_no);
//   if (!entry) return res.status(400).json({ error: 'No OTP requested for this GID' });
//   if (Date.now() > entry.expires) return res.status(400).json({ error: 'OTP expired' });
//   if (entry.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
//   res.json({ success: true });
// });

// // 3. Reset Password
// app.post('/api/reset-password', async (req, res) => {
//   const { gid_no, otp, newPassword } = req.body;
//   const entry = otpStore.get(gid_no);
//   if (!entry || entry.otp !== otp || Date.now() > entry.expires) {
//     return res.status(400).json({ error: 'Invalid or expired OTP.' });
//   }
//   const { hashPassword } = require('./hash');
//   const hashed = await hashPassword(newPassword);
//   await pool.query('UPDATE users SET password = $1 WHERE gid_no = $2', [hashed, gid_no]);
//   otpStore.delete(gid_no);
//   res.json({ success: true });
// });

// //////////////////////////////////////////////////////////



const offboardReqCalls = require('./offboard_req_calls/offboard_req_calls');
app.use('/api', offboardReqCalls);

// ////////////////////////////////////////////////////////
// // --- OFFBOARD REQUESTS ---

// // 1. Submit Offboard Request (Client)
// app.post('/api/offboard-requests', authorize(['client']), async (req, res) => {
//   const client_id = req.user.userId;
//   const { username, lanId, accessRevoke, acknowledged } = req.body;
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // Delete any previous pending requests for this client
//     await client.query(
//       `DELETE FROM offboard_requests WHERE client_id = $1 AND status = 'pending'`,
//       [client_id]
//     );

//     // Insert new request
//     await client.query(
//       `INSERT INTO offboard_requests
//         (client_id, username, lan_id, access_revoke, acknowledged)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [client_id, username, lanId, accessRevoke, acknowledged]
//     );

//     // Fetch client info and reporting manager email
//     const userRes = await client.query(
//       `SELECT u.username, u.gid_no, u.email, rm.email AS manager_email
//        FROM users u
//        LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//        WHERE u.user_id = $1`,
//       [client_id]
//     );
//     if (userRes.rows.length > 0 && userRes.rows[0].manager_email) {
//       const clientInfo = {
//         name: userRes.rows[0].username,
//         gid: userRes.rows[0].gid_no,
//         email: userRes.rows[0].email
//       };
//       // Parse accessRevoke as array if needed
//       let accessList = Array.isArray(accessRevoke) ? accessRevoke : (accessRevoke ? accessRevoke.split(',') : []);
//       await sendOffboardRequestToManager(userRes.rows[0].manager_email, clientInfo, accessList, acknowledged);
//     }

//     await client.query('COMMIT');
//     res.json({ success: true });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();now 
//   }
// });



// // 2. Get Pending Offboard Requests (Admin/Team)
// app.get('/api/client-requests', authorize(['admin', 'team']), async (req, res) => {
//   try {
//     const user = req.user;
//     let query = `
//       SELECT DISTINCT ON (r.client_id) r.*, u.username as client_username, u.email as client_email, u.gid_no as client_gid
//       FROM offboard_requests r
//       JOIN users u ON r.client_id = u.user_id
//       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//       WHERE r.status = 'pending'
//     `;
//     let params = [];

//     if (user.role === 'team') {
//       // Only show requests for clients who report to this manager
//       query += ` AND u.reporting_manager_gid = $1`;
//       params.push(user.gid_no);
//     }

//     query += ` ORDER BY r.client_id, r.created_at DESC`;

//     const { rows } = await pool.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error in /api/client-requests:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // 3. Accept/Reject Offboard Request (Admin/Team)
// app.post('/api/offboard-requests/:id/decision', authorize(['admin', 'team']), async (req, res) => {
//   const { id } = req.params;
//   const { decision, notes } = req.body;
//   const userId = req.user.userId;

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // Lock and get the request
//     const request = await client.query(
//       'SELECT status, client_id FROM offboard_requests WHERE id = $1 FOR UPDATE',
//       [id]
//     );
//     if (request.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: "Request not found" });
//     }
//     if (request.rows[0].status !== 'pending') {
//       await client.query('ROLLBACK');
//       return res.status(400).json({ error: "Request already processed" });
//     }

//     const clientId = request.rows[0].client_id;

//     // Get gid_no and email for this client
//     const userRes = await client.query(
//       'SELECT gid_no, email, username FROM users WHERE user_id = $1',
//       [clientId]
//     );
//     if (userRes.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: "User not found" });
//     }
//     const gid_no = userRes.rows[0].gid_no;
//     const clientEmail = userRes.rows[0].email;

//     // Get manager name
//     const managerRes = await client.query(
//       'SELECT username FROM users WHERE user_id = $1',
//       [userId]
//     );
//     const managerName = managerRes.rows.length > 0 ? managerRes.rows[0].username : 'Manager';

//     // Update the selected request
//     await client.query(
//       `UPDATE offboard_requests
//        SET status = $1, decided_by = $2, decided_at = NOW()
//        WHERE id = $3`,
//       [decision, userId, id]
//     );

//     if (decision === 'accepted') {
//       // Mark all other pending requests for this client as 'removed'
//       await client.query(
//         `UPDATE offboard_requests SET status = 'removed', decided_at = NOW()
//          WHERE client_id = $1 AND status = 'pending' AND id != $2`,
//         [clientId, id]
//       );
//       // Delete the client user (CASCADE will handle all related tables due to FK)
//       await client.query('DELETE FROM users WHERE user_id = $1', [clientId]);
//     }

//     await client.query('COMMIT');
//     // Notify client by email
//     if (clientEmail) {
//       await sendOffboardStatusToClient(clientEmail, decision, managerName, notes);
//     }
//     res.json({ success: true });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });

// // --- END OFFBOARD REQUESTS ---
// //////////////////////////////////////////////////////////



const adminCalls = require('./role_based_calls/admin_calls');
app.use('/api', adminCalls);

// ////////////////////////////////////////////////////////////
// //////////--- Admin Dashboard Data ---//////////

// // ADMIN DASHBOARD DATA
// app.get('/api/admin-data', authorize(['admin']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       "SELECT username, email, gid_no, role, phone FROM users WHERE gid_no = $1 AND role = 'admin' LIMIT 1",
//       [req.user.gid_no]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Admin not found" });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch admin data." });
//   }
// });

// // PATCH admin profile (username, email, password, gid_no, phone)
// app.patch('/api/admin-data', authorize(['admin']), async (req, res) => {
//   const { username, email, password, gid_no, phone } = req.body;
//   try {
//     if (!username || !email || !gid_no || !phone) {
//       return res.status(400).json({ error: "All fields are required." });
//     }
    
//     if (password) {
//       // Hash the password before saving
//       const { hashPassword } = require('./hash');
//       const hashedPassword = await hashPassword(password);
      
//       await pool.query(
//         "UPDATE users SET username = $1, email = $2, password = $3, gid_no = $4, phone = $5 WHERE user_id = $6 AND role = 'admin'",
//         [username, email, hashedPassword, gid_no, phone, req.user.userId]
//       );
//     } else {
//       await pool.query(
//         "UPDATE users SET username = $1, email = $2, gid_no = $3, phone = $4 WHERE user_id = $5 AND role = 'admin'",
//         [username, email, gid_no, phone, req.user.userId]
//       );
//     }
//     res.json({ success: true });
//   } catch (err) {
//     // Unique constraint violation for GID
//     if (err.code === "23505") {
//       return res.status(409).json({ error: "GID No. already exists. Please use a unique GID No." });
//     }
//     res.status(500).json({ error: "Failed to update profile." });
//   }
// });

// // ADD NEW TEAM MEMBER (with GID validation, random password, and email)
// app.post('/api/team-members', authorize(['admin']), async (req, res) => {
//   const { username, email, gid_no, active, reporting_manager_gid, phone, application_ids } = req.body; // application_ids is now an array
//   try {
//     const { rows: existing } = await pool.query(
//       "SELECT * FROM users WHERE gid_no = $1",
//       [gid_no]
//     );
//     if (existing.length > 0) {
//       return res.status(400).json({ error: "GID No. already exists" });
//     }
//     const password = generateRandomPassword(10);
//     const { hashPassword } = require('./hash');
//     const hashedPassword = await hashPassword(password);
//     await pool.query(
//       "INSERT INTO users (username, password, email, gid_no, role, active, reporting_manager_gid, phone) VALUES ($1, $2, $3, $4, 'team', $5, $6, $7)",
//       [username, hashedPassword, email, gid_no, active, reporting_manager_gid, phone]
//     );
//     // Insert all selected applications
//     if (Array.isArray(application_ids)) {
//       for (const appId of application_ids) {
//         await pool.query(
//           "INSERT INTO application_details (application_id, gid_no) VALUES ($1, $2)",
//           [appId, gid_no]
//         );
//       }
//     }
//     await sendAccountEmail(email, username, password, gid_no);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // USER STATUS TOGGLE (Team Members)
// app.patch('/api/team-members/:id/active', authorize(['admin']), async (req, res) => {
//   const { id } = req.params;
//   const { active } = req.body;
//   try {
//     await pool.query(
//       "UPDATE users SET active = $1 WHERE user_id = $2 AND role = 'team'",
//       [active, id]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE TEAM MEMBER (with email notification and CASCADE delete)
// app.delete('/api/team-members/:id', authorize(['admin']), async (req, res) => {
//   const { id } = req.params;
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     // 1. Get team member details before deletion
//     const { rows: memberRows } = await client.query(
//       `SELECT u.gid_no, u.username, u.email, u.role 
//        FROM users u 
//        WHERE u.user_id = $1 AND u.role = 'team'`,
//       [id]
//     );
    
//     if (memberRows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ error: "Team member not found" });
//     }
    
//     const teamMember = memberRows[0];
    
//     // 2. Get admin details for the email
//     const { rows: adminRows } = await client.query(
//       `SELECT username FROM users WHERE user_id = $1 AND role = 'admin'`,
//       [req.user.userId]
//     );
    
//     const adminName = adminRows.length > 0 ? adminRows[0].username : 'System Administrator';
    
//     // 3. Delete from users table (CASCADE will handle related tables)
//     await client.query("DELETE FROM users WHERE user_id = $1 AND role = 'team'", [id]);
    
//     await client.query('COMMIT');
    
//     // 4. Send offboarding notification email
//     try {
//       if (teamMember.email) {
//         await sendTeamOffboardNotification(
//           teamMember.email,
//           teamMember.username,
//           teamMember.gid_no,
//           adminName
//         );
//         console.log(`Offboarding email sent to ${teamMember.email}`);
//       }
//     } catch (emailError) {
//       console.error('Failed to send offboarding email:', emailError);
//       // Don't fail the deletion if email fails
//     }
    
//     res.json({ 
//       success: true, 
//       message: 'Team member deleted successfully',
//       emailSent: !!teamMember.email 
//     });
    
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Delete team member error:', err);
//     res.status(500).json({ error: "Failed to delete team member." });
//   } finally {
//     client.release();
//   }
// });

// // PATCH team member info (username, email, phone, reporting_manager_gid)
// app.patch('/api/team-members/:id', async (req, res) => {
//   const { id } = req.params;
//   const { username, email, phone, reporting_manager_gid, application_ids, gid_no } = req.body;
//   try {
//     await pool.query(
//       `UPDATE users
//          SET username = $1,
//              email = $2,
//              phone = $3,
//              reporting_manager_gid = $4
//        WHERE user_id = $5 AND role = 'team'`,
//       [username, email, phone, reporting_manager_gid, id]
//     );
//     // Update application_details mapping
//     if (Array.isArray(application_ids) && gid_no) {
//       // Remove all old mappings
//       await pool.query(
//         `DELETE FROM application_details WHERE gid_no = $1`,
//         [gid_no]
//       );
//       // Insert new mappings
//       for (const appId of application_ids) {
//         await pool.query(
//           `INSERT INTO application_details (application_id, gid_no)
//            VALUES ($1, $2)
//            ON CONFLICT (application_id, gid_no) DO NOTHING`,
//           [appId, gid_no]
//         );
//       }
//     }
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update team member." });
//   }
// });

// // Promote/Demote a user (admin only)
// app.patch('/api/promote-user/:id', authorize(['admin']), async (req, res) => {
//   const { id } = req.params;
//   const { role } = req.body;
//   if (!["client", "team", "admin"].includes(role)) {
//     return res.status(400).json({ error: "Invalid role" });
//   }
//   try {
//     await pool.query(
//       "UPDATE users SET role = $1 WHERE user_id = $2",
//       [role, id]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update role." });
//   }
// });

// ///get all users (admin only)
// app.get('/api/all-users', authorize(['admin']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT user_id, username, gid_no, role FROM users ORDER BY username`
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch users." });
//   }
// });

// ////////////////////////////////////////////////////////////



const teamsCalls = require('./role_based_calls/teams_calls');
app.use('/api', teamsCalls);


// ///////////////////////////////////////////////////////////
// //////// --- TEAM DASHBOARD DATA ---////////////////////

// // TEAM DASHBOARD DATA
// app.get('/api/team-data', authorize(['team']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT 
//           u.username,
//           u.email,
//           u.gid_no,
//           u.role,
//           u.phone,
//           rm.username AS reporting_manager_username,
//           rm.gid_no AS reporting_manager_gid_no,
//           rm.phone AS reporting_manager_phone,
//           ARRAY_REMOVE(ARRAY_AGG(a.application_name), NULL) AS application_names
//        FROM users u
//        LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//        LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//        LEFT JOIN application a ON ad.application_id = a.application_id
//        WHERE u.user_id = $1
//        GROUP BY u.user_id, rm.username, rm.gid_no, rm.phone
//        LIMIT 1`,
//       [req.user.userId]
//     );
//     if (rows.length === 0) return res.status(404).json({ error: "User not found" });
//     const team = rows[0];
//     res.json({
//       username: team.username,
//       email: team.email,
//       gid_no: team.gid_no,
//       role: team.role,
//       phone: team.phone,
//       application_names: team.application_names,
//       reporting_manager: team.reporting_manager_username
//         ? {
//             username: team.reporting_manager_username,
//             gid_no: team.reporting_manager_gid_no,
//             phone: team.reporting_manager_phone
//           }
//         : null
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PATCH team data (email, password, phone)
// app.patch('/api/team-data', authorize(['team']), async (req, res) => {
//   const { email, password, phone } = req.body;
//   try {
//     if (!email || !phone) {
//       return res.status(400).json({ error: "Email and phone are required." });
//     }
//     if (password) {
//       const { hashPassword } = require('./hash');
//       const hashedPassword = await hashPassword(password);
//       await pool.query(
//         "UPDATE users SET email = $1, password = $2, phone = $3 WHERE gid_no = $4 AND role = 'team'",
//         [email, hashedPassword, phone, req.user.gid_no]
//       );
//       return res.json({ success: true, passwordChanged: true });
//     } else {
//       await pool.query(
//         "UPDATE users SET email = $1, phone = $2 WHERE gid_no = $3 AND role = 'team'",
//         [email, phone, req.user.gid_no]
//       );
//       return res.json({ success: true });
//     }
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update profile." });
//   }
// });


// // GET clients for all applications a team manager is enrolled in
// app.get('/api/myteam-clients', authorize(['team']), async (req, res) => {
//   try {
//     // Get all clients who report directly to this team manager
//     const { rows: clients } = await pool.query(
//       `SELECT
//         u.user_id,
//         u.username,
//         u.email,
//         u.gid_no,
//         u.created_at,
//         u.active,
//         u.phone,
//         u.added_by_username,
//         u.reporting_manager_gid,
//         rm.username AS reporting_manager_username,
//         rm.gid_no AS reporting_manager_gid,
//         rm.phone AS reporting_manager_phone,
//         a.application_name,
//         ad.application_id,
//         ad.head_application
//       FROM users u
//       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//       LEFT JOIN application a ON ad.application_id = a.application_id
//       WHERE u.role = 'client'
//         AND u.reporting_manager_gid = $1
//       ORDER BY u.username`,
//       [req.user.gid_no]
//     );
//     res.json(clients);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch my team clients." });
//   }
// });
// /////////////////////////////////////////////////////////



const commonCalls = require('./role_based_calls/common_calls');
app.use('/api', commonCalls);

// ////////////////////////////////////////////////////////
// //////--Admin and Team Members Management--//////

// // GET all team members with their application enrollment and head status
// app.get('/api/team-members', async (req, res) => {
//   try {
//     const { rows } = await pool.query(`
//       SELECT 
//         u.user_id,
//         u.username,
//         u.email,
//         u.gid_no,
//         u.role,
//         u.created_at,
//         u.active,
//         u.phone,
//         rm.username AS reporting_manager_username,
//         u.reporting_manager_gid,
//         rm.phone AS reporting_manager_phone,
//         ARRAY_REMOVE(ARRAY_AGG(ad.application_id), NULL) AS application_ids,
//         ARRAY_REMOVE(ARRAY_AGG(a.application_name), NULL) AS application_names,
//         BOOL_OR(ad.head_application) AS head_application
//       FROM users u
//       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//       LEFT JOIN application a ON ad.application_id = a.application_id
//       WHERE u.role IN ('team', 'admin') AND u.active = TRUE
//       GROUP BY u.user_id, rm.username, rm.phone
//       ORDER BY 
//         CASE WHEN u.role = 'admin' THEN 0 ELSE 1 END,
//         u.username
//     `);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch team members." });
//   }
// });


// // GET all client members with their application enrollment and head status
// app.get('/api/client-members', async (req, res) => {
//   try {
//     const { rows: clients } = await pool.query(`
//       SELECT
//         u.user_id,
//         u.username,
//         u.email,
//         u.gid_no,
//         u.created_at,
//         u.active,
//         u.phone,
//         u.added_by_username,
//         u.reporting_manager_gid,
//         rm.username AS reporting_manager_username,
//         rm.gid_no AS reporting_manager_gid,
//         rm.phone AS reporting_manager_phone,
//         a.application_name,
//         ad.application_id,
//         ad.head_application
//       FROM users u
//       LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//       LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//       LEFT JOIN application a ON ad.application_id = a.application_id
//       WHERE u.role = 'client'
//       ORDER BY u.username
//     `);
//     res.json(clients);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch client members." });
//   }
// });
// // Helper: Create alarms for all relevant access types for a user
// async function createAllAccessAlarmsForUser(gid_no, application_id) {
//   // Get all access types: global (is_application = false) and for this application (is_application = true AND application_id matches)
//   const { rows: accesses } = await pool.query(
//     `SELECT access_id, duration_in_days FROM access
//      WHERE is_application = false OR (is_application = true AND application_id = $1)`,
//     [application_id]
//   );
//   for (const access of accesses) {
//     await pool.query(
//       `INSERT INTO access_alarm (gid_no, access_id, deadline_date)
//        VALUES ($1, $2, CURRENT_DATE + ($3 || ' days')::interval)
//        ON CONFLICT (gid_no, access_id) DO NOTHING`,
//       [gid_no, access.access_id, access.duration_in_days]
//     );
//   }
// }

// // ADD NEW CLIENT MEMBER (with GID validation, random password, and email)
// app.post('/api/client-members', authorize(['admin', 'team']), async (req, res) => {
//   const { username, email, gid_no, active, reporting_manager_gid, phone, application_id } = req.body;
//   try {
    
//     const { rows: existing } = await pool.query(
//       "SELECT * FROM users WHERE gid_no = $1",
//       [gid_no]
//     );
//     if (existing.length > 0) {
//       return res.status(400).json({ error: "GID No. already exists" });
//     }
//     const password = generateRandomPassword(10);
//     const { hashPassword } = require('./hash');
//     const hashedPassword = await hashPassword(password);
//     await pool.query(
//       "INSERT INTO users (username, password, email, gid_no, role, active, reporting_manager_gid, phone) VALUES ($1, $2, $3, $4, 'client', $5, $6, $7)",
//       [username, hashedPassword, email, gid_no, active, reporting_manager_gid, phone]
//     );
//     if (application_id) {
//       await pool.query(
//         "INSERT INTO application_details (application_id, gid_no) VALUES ($1, $2)",
//         [application_id, gid_no]
//       );
//     }
//     // Only create alarms for relevant access types
//     await createAllAccessAlarmsForUser(gid_no, application_id);
//     await sendAccountEmail(email, username, password, gid_no);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PATCH client member info (including application)
// app.patch('/api/client-members/:id', async (req, res) => {
//   const { id } = req.params;
//   const { username, email, phone, reporting_manager_gid, application_id, gid_no } = req.body;
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // 1. Update user info
//     await client.query(
//       `UPDATE users
//          SET username = $1,
//              email = $2,
//              phone = $3,
//              reporting_manager_gid = $4
//        WHERE user_id = $5 AND role = 'client'`,
//       [username, email, phone, reporting_manager_gid, id]
//     );

//     // 2. Update application_details mapping
//     if (application_id && gid_no) {
//       // Remove old mapping(s)
//       await client.query(
//         `DELETE FROM application_details WHERE gid_no = $1`,
//         [gid_no]
//       );
//       // Insert new mapping
//       await client.query(
//         `INSERT INTO application_details (application_id, gid_no)
//          VALUES ($1, $2)
//          ON CONFLICT (application_id, gid_no) DO NOTHING`,
//         [application_id, gid_no]
//       );
//     }
// // Remove all application-specific user_access

// try {
//   const result = await client.query(
//     `DELETE FROM user_access
//      WHERE gid_no = $1
//        AND access_id IN (
//          SELECT access_id FROM access
//          WHERE is_application = true
//        )`,
//     [gid_no]
//   );
//   console.log(result.rowCount + ' application-specific user_access deleted for gid_no: ' + gid_no);
   
// } catch (err) {
//   console.error('Error deleting from user_access:', err.message);
// }

//     // 3. Remove only alarms for application-specific access (is_application = true)
//     await client.query(
//       `DELETE FROM access_alarm
//        WHERE gid_no = $1
//          AND access_id IN (
//            SELECT access_id FROM access WHERE is_application = true
//          )`,
//       [gid_no]
//     );

//     // 4. Add alarms for all relevant access (global + new app)
//     const { rows: accesses } = await client.query(
//       `SELECT access_id, duration_in_days FROM access
//        WHERE is_application = false OR (is_application = true AND application_id = $1)`,
//       [application_id]
//     );
//     for (const access of accesses) {
//       await client.query(
//         `INSERT INTO access_alarm (gid_no, access_id, deadline_date)
//          VALUES ($1, $2, CURRENT_DATE + ($3 || ' days')::interval)
//          ON CONFLICT (gid_no, access_id) DO NOTHING`,
//         [gid_no, access.access_id, access.duration_in_days]
//       );
//     }

//     await client.query('COMMIT');
//     res.json({ success: true });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });


// // USER STATUS TOGGLE (Clients)
// app.patch('/api/client-members/:id/active', authorize(['admin', 'team']), async (req, res) => {
//   const { id } = req.params;
//   const { active } = req.body;
//   try {
//     await pool.query(
//       "UPDATE users SET active = $1 WHERE user_id = $2 AND role = 'client'",
//       [active, id]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.delete('/api/client-members/:id', authorize(['admin', 'team']), async (req, res) => {
//   const { id } = req.params;
//   try {
//     // 1. Ensure the user is a client and get gid_no for response/logging (optional)
//     const { rows } = await pool.query(
//       "SELECT gid_no FROM users WHERE user_id = $1 AND role = 'client'",
//       [id]
//     );
//     if (rows.length === 0) return res.status(404).json({ error: "Client not found" });

//     // 2. Delete from users (cascades to all related tables)
//     await pool.query("DELETE FROM users WHERE user_id = $1", [id]);

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Delete client error:", err);
//     res.status(500).json({ error: "Failed to delete client." });
//   }
// });




// //////////////////////////////////////////////////////






// //////////////////////////////////////////////////
// //////// --- CLIENT DASHBOARD DATA ---////////////////////

// // CLIENT DASHBOARD DATA (with reporting manager info)
// app.get('/api/client-data', authorize(['client']), async (req, res) => {  
//   try {
//     const { rows } = await pool.query(
//       `SELECT 
//           u.username, u.email, u.gid_no, u.phone,
//           a.application_name,
//           ad.application_id,  -- <--- ADD THIS LINE
//           rm.username AS reporting_manager_username,
//           rm.gid_no AS reporting_manager_gid_no,
//           rm.phone AS reporting_manager_phone
//        FROM users u
//        LEFT JOIN users rm ON u.reporting_manager_gid = rm.gid_no
//        LEFT JOIN application_details ad ON u.gid_no = ad.gid_no
//        LEFT JOIN application a ON ad.application_id = a.application_id
//        WHERE u.user_id = $1
//        LIMIT 1`,
//       [req.user.userId]
//     );

//     if (rows.length === 0) return res.status(404).json({ error: "Client not found" });
    
//     const client = rows[0];
//     res.json({
//       username: client.username,
//       email: client.email,
//       gid_no: client.gid_no,
//       phone: client.phone,
//       application_name: client.application_name,
//       application_id: client.application_id, // <--- ADD THIS LINE
//       reporting_manager: client.reporting_manager_username
//         ? {
//             username: client.reporting_manager_username,
//             gid_no: client.reporting_manager_gid_no,
//             phone: client.reporting_manager_phone
//           }
//         : null
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // --- CHANGE PASSWORD ENDPOINT (for client, team, admin) ---
// app.patch('/api/change-password', authorize(['client']), async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const gid_no = req.user.gid_no;

//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({ error: "Current and new password required." });
//   }

//   try {
//     // Get user by gid_no
//     const { rows } = await pool.query(
//       "SELECT password FROM users WHERE gid_no = $1",
//       [gid_no]
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     const { comparePassword, hashPassword } = require('./hash');
//     const match = await comparePassword(currentPassword, rows[0].password);
//     if (!match) {
//       return res.status(401).json({ error: "Current password is incorrect." });
//     }

//     const hashed = await hashPassword(newPassword);
//     await pool.query(
//       "UPDATE users SET password = $1 WHERE gid_no = $2",
//       [hashed, gid_no]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update password." });
//   }
// });

// ////////////////////////////////////////////////////////



const applicationAccessCalls = require('./application_access_calls/application_access_calls');
app.use('/api', applicationAccessCalls);


// //////////////////////////////////////////////////////
// ////----Application & Accesss Management----////

// // Get all access types
// app.get('/api/access', async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       "SELECT access_id, access_name, duration_in_days, is_application, application_id FROM access ORDER BY access_id"
//     );
//     res.json(rows);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch access types." });
//   }
// });

// // GET ALL APPLICATIONS (for Application Management)
// app.get("/api/applications", async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       "SELECT application_id, application_name FROM application ORDER BY application_id"
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications." });
//   }
// });

// // Add a new access type (with duplicate check)
// app.post('/api/access', async (req, res) => {
//   const { access_name, duration_in_days, is_application, application_id } = req.body;
//   if (!access_name || !access_name.trim()) {
//     return res.status(400).json({ error: "Access name is required." });
//   }
//   try {
//     const { rows } = await pool.query(
//       "SELECT 1 FROM access WHERE LOWER(access_name) = LOWER($1)",
//       [access_name.trim()]
//     );
//     if (rows.length > 0) {
//       return res.status(409).json({ error: "Access name already exists. Please choose a different name." });
//     }
//     const insert = await pool.query(
//       "INSERT INTO access (access_name, duration_in_days, is_application, application_id) VALUES ($1, $2, $3, $4) RETURNING *",
//       [access_name.trim(), duration_in_days || 0, is_application || false, is_application ? application_id : null]
//     );
//     res.status(201).json(insert.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add access." });
//   }
// });

// // Delete an access type
// app.delete('/api/access/:access_id', async (req, res) => {
//   const { access_id } = req.params;
//   try {
//     // Optionally delete from user_access first if you want to avoid FK violation
//     await pool.query("DELETE FROM user_access WHERE access_id = $1", [access_id]);
//     await pool.query("DELETE FROM access WHERE access_id = $1", [access_id]);
//     res.json({ success: true });
//   } catch {
//     res.status(500).json({ error: "Failed to delete access." });
//   }
// });

// // Update an access type
// app.patch('/api/access/:access_id', async (req, res) => {
//   const { access_id } = req.params;
//   const { access_name, duration_in_days, is_application, application_id } = req.body;
  
//   if (!access_name || !access_name.trim()) {
//     return res.status(400).json({ error: "Access name is required." });
//   }
  
//   try {
//     // Check if name exists for other records (excluding current one)
//     const { rows: existing } = await pool.query(
//       "SELECT 1 FROM access WHERE LOWER(access_name) = LOWER($1) AND access_id != $2",
//       [access_name.trim(), access_id]
//     );
    
//     if (existing.length > 0) {
//       return res.status(409).json({ error: "Access name already exists. Please choose a different name." });
//     }
    
//     const { rows } = await pool.query(
//       `UPDATE access 
//        SET access_name = $1, duration_in_days = $2, is_application = $3, application_id = $4
//        WHERE access_id = $5
//        RETURNING *`,
//       [
//         access_name.trim(), 
//         duration_in_days || 0, 
//         is_application || false, 
//         is_application ? application_id : null, 
//         access_id
//       ]
//     );
    
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Access type not found." });
//     }
    
//     res.json(rows[0]);
//   } catch (err) {
//     console.error('Error updating access:', err);
//     res.status(500).json({ error: "Failed to update access type." });
//   }
// });


// // PUT /api/user-access/:gid_no
// app.put('/api/user-access/:gid_no', async (req, res) => {
//   const { gid_no } = req.params;
//   const { access_ids } = req.body; // array of access_id
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     await client.query("DELETE FROM user_access WHERE gid_no = $1", [gid_no]);
//     for (const access_id of access_ids) {
//       const heh = await client.query(
//         "INSERT INTO user_access (gid_no, access_id) VALUES ($1, $2)",
//         [gid_no, access_id]
//       );
//       console.log(`Access ${access_id} assigned to ${gid_no}:`, heh.rowCount);
//     }
//     await client.query('COMMIT');
//     res.json({ success: true });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: "Failed to update access." });
//   } finally {
//     client.release();
//   }
// });


// // Get team members enrolled in a specific application
// app.get('/api/applications/:application_id/team-members', async (req, res) => {
//   const { application_id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       `SELECT u.gid_no, u.username
//          FROM application_details ad
//          JOIN users u ON ad.gid_no = u.gid_no
//         WHERE ad.application_id = $1 AND u.role = 'team'`,
//       [application_id]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch team members for application." });
//   }
// });

// // POST a new application
// // POST a new application (with duplicate name check)
// app.post("/api/applications", async (req, res) => {
//   const { application_name } = req.body;
//   if (!application_name || !application_name.trim()) {
//     return res.status(400).json({ error: "Application name is required." });
//   }
//   try {
//     // Check if name exists (case-insensitive)
//     const { rows } = await pool.query(
//       "SELECT 1 FROM application WHERE LOWER(application_name) = LOWER($1)",
//       [application_name.trim()]
//     );
//     if (rows.length > 0) {
//       return res.status(409).json({ error: "Application name already exists. Please choose a different name." });
//     }
//     const insert = await pool.query(
//       "INSERT INTO application (application_name) VALUES ($1) RETURNING application_id, application_name",
//       [application_name.trim()]
//     );
//     res.status(201).json(insert.rows[0]);
//   } catch (err) {
//     // Fallback for race conditions or constraint violation
//     if (err.code === "23505") {
//       return res.status(409).json({ error: "Application name already exists. Please choose a different name." });
//     }
//     res.status(500).json({ error: "Failed to add application." });
//   }
// });


// app.get("/api/applications-with-head", async (req, res) => {
//   try {
//     const { rows } = await pool.query(`
//       SELECT 
//         a.application_id,
//         a.application_name,
//         ad.gid_no,
//         u.username AS head_username
//       FROM application a
//       LEFT JOIN application_details ad
//         ON a.application_id = ad.application_id AND ad.head_application = TRUE
//       LEFT JOIN users u
//         ON ad.gid_no = u.gid_no
//       ORDER BY a.application_id
//     `);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch applications." });
//   }
// });

// // DELETE an application
// app.delete("/api/applications/:application_id", async (req, res) => {
//   const { application_id } = req.params;
//   try {
//     // First delete any details (if using application_details mapping)
//     await pool.query("DELETE FROM application_details WHERE application_id = $1", [application_id]);
//     // Then delete the application
//     await pool.query("DELETE FROM application WHERE application_id = $1", [application_id]);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to delete application." });
//   }
// });

// app.put("/api/applications/:application_id/head", async (req, res) => {
//   const { application_id } = req.params;
//   const { gid_no } = req.body;
//   if (!gid_no) {
//     return res.status(400).json({ error: "gid_no is required." });
//   }
//   try {
//     // 1. Set all heads for this application to FALSE
//     await pool.query(
//       "UPDATE application_details SET head_application = FALSE WHERE application_id = $1",
//       [application_id]
//     );
//     // 2. Set the selected member as head (UPSERT)
//     await pool.query(
//       `INSERT INTO application_details (application_id, gid_no, head_application)
//        VALUES ($1, $2, TRUE)
//        ON CONFLICT (application_id, gid_no)
//        DO UPDATE SET head_application = EXCLUDED.head_application`,
//       [application_id, gid_no]
//     );
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update application head." });
//   }
// });

// // GET all access types assigned to a user (by gid_no)
// app.get('/api/user-access/:gid_no', async (req, res) => {
//   const { gid_no } = req.params;
//   try {
//     const { rows } = await pool.query(
//       `SELECT a.access_id, a.access_name
//          FROM user_access ua
//          JOIN access a ON ua.access_id = a.access_id
//         WHERE ua.gid_no = $1
//         ORDER BY a.access_name`,
//       [gid_no]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch user access." });
//   }
// });


// /////////////////////////////////////////////////




// // /////////////////////////////////////////////////////////
// // // --- TASK MANAGEMENT ENDPOINTS ---

// // GET all tasks
// app.get('/api/tasks', authorize(['admin', 'team']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(`
//       SELECT task_id, task_name, task_description, task_link, task_duration, documents, created_at
//       FROM task_table
//       ORDER BY created_at DESC
//     `);
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // CREATE new task
// app.post('/api/tasks', authorize(['admin', 'team']), upload.array('documents', 5), async (req, res) => {
//   const { task_name, task_description, task_link, task_duration } = req.body;
  
//   if (!task_name || !task_description || !task_duration) {
//     return res.status(400).json({ error: 'Task name, description, and duration are required' });
//   }

//   try {
//     // Get uploaded file names
//     const documents = req.files ? req.files.map(file => file.filename) : [];
    
//     const { rows } = await pool.query(`
//       INSERT INTO task_table (task_name, task_description, task_link, task_duration, documents)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING task_id, task_name, task_description, task_link, task_duration, documents, created_at
//     `, [task_name, task_description, task_link || null, parseInt(task_duration), documents]);
    
//     res.json(rows[0]);
//   } catch (err) {
//     // Clean up uploaded files if database operation fails
//     if (req.files) {
//       req.files.forEach(file => {
//         fs.unlink(file.path, (err) => {
//           if (err) console.error('Error deleting file:', err);
//         });
//       });
//     }
//     res.status(500).json({ error: err.message });
//   }
// });

// // UPDATE task
// app.put('/api/tasks/:task_id', authorize(['admin', 'team']), upload.array('documents', 5), async (req, res) => {
//   const { task_id } = req.params;
//   const { task_name, task_description, task_link, task_duration, existingDocuments } = req.body;
  
//   if (!task_name || !task_description || !task_duration) {
//     return res.status(400).json({ error: 'Task name, description, and duration are required' });
//   }

//   try {
//     // Parse existing documents (documents to keep)
//     const keepDocuments = existingDocuments ? JSON.parse(existingDocuments) : [];
    
//     // Get new uploaded file names
//     const newDocuments = req.files ? req.files.map(file => file.filename) : [];
    
//     // Combine kept existing documents with new documents
//     const allDocuments = [...keepDocuments, ...newDocuments];
    
//     // Get current task documents to clean up removed files
//     const currentTask = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
//     const currentDocuments = currentTask.rows[0]?.documents || [];
    
//     // Find documents to delete (current documents not in keepDocuments)
//     const documentsToDelete = currentDocuments.filter(doc => !keepDocuments.includes(doc));
    
//     // Delete removed files from filesystem
//     documentsToDelete.forEach(filename => {
//       const filePath = path.join(uploadsDir, filename);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting file:', err);
//       });
//     });
    
//     const { rows } = await pool.query(
//       `
//       UPDATE task_table 
//       SET task_name = $1, task_description = $2, task_link = $3, task_duration = $4, documents = $5
//       WHERE task_id = $6
//       RETURNING task_id, task_name, task_description, task_link, task_duration, documents, created_at
//     `, [task_name, task_description, task_link || null, parseInt(task_duration), allDocuments, task_id]);
    
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
    
//     res.json(rows[0]);
//   } catch (err) {
//     // Clean up uploaded files if database operation fails
//     if (req.files) {
//       req.files.forEach(file => {
//         fs.unlink(file.path, (err) => {
//           if (err) console.error('Error deleting file:', err);
//         });
//       });
//     }
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add endpoint to download documents
// app.get('/api/tasks/:task_id/download/:filename', authorize(['admin', 'team', 'client']), async (req, res) => {
//   const { task_id, filename } = req.params;
  
//   try {
//     // Verify the file belongs to the task
//     const { rows } = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
    
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
    
//     const documents = rows[0].documents || [];
//     if (!documents.includes(filename)) {
//       return res.status(404).json({ error: 'Document not found' });
//     }
    
//     const filePath = path.join(uploadsDir, filename);
    
//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ error: 'File not found on server' });
//     }
    
//     res.download(filePath);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update the DELETE endpoint to also delete associated files
// app.delete('/api/tasks/:task_id', authorize(['admin', 'team']), async (req, res) => {
//   const { task_id } = req.params;
  
//   try {
//     // Get documents before deletion
//     const { rows: taskRows } = await pool.query('SELECT documents FROM task_table WHERE task_id = $1', [task_id]);
//     const documents = taskRows[0]?.documents || [];
    
//     // Delete from database
//     const { rows } = await pool.query(`
//       DELETE FROM task_table WHERE task_id = $1 RETURNING task_id
//     `, [task_id]);
    
//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
    
//     // Delete associated files
//     documents.forEach(filename => {
//       const filePath = path.join(uploadsDir, filename);
//       fs.unlink(filePath, (err) => {
//         if (err) console.error('Error deleting file:', err);
//       });
//     });
    
//     res.json({ success: true, message: 'Task and associated documents deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Assign tasks to multiple employees
// app.post('/api/assign-tasks', authorize(['admin', 'team']), async (req, res) => {
//   const { assignments } = req.body; // Array of {gid_no, task_id, deadline_days_left}
  
//   if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
//     return res.status(400).json({ error: 'No assignments provided' });
//   }

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
    
//     let successCount = 0;
//     let duplicateCount = 0;
    
//     for (const assignment of assignments) {
//       const { gid_no, task_id, deadline_days_left } = assignment;
      
//       try {
//         // Check if assignment already exists
//         const { rows: existing } = await client.query(
//           'SELECT 1 FROM assigned_tasks WHERE gid_no = $1 AND task_id = $2',
//           [gid_no, task_id]
//         );
        
//         if (existing.length > 0) {
//           duplicateCount++;
//           continue; // Skip this assignment
//         }
        
//         // Insert new assignment with correct syntax
//         await client.query(
//           `INSERT INTO assigned_tasks 
//            (gid_no, task_id, deadline_days_left, assigned_at, completed_by_emp, completed_by_manager)
//            VALUES ($1, $2, $3, NOW(), FALSE, FALSE)`,
//           [gid_no, task_id, deadline_days_left]
//         );
        
//         successCount++;
//       } catch (err) {
//         console.error(`Error assigning task ${task_id} to ${gid_no}:`, err);
//         // Continue with other assignments even if one fails
//       }
//     }
    
//     await client.query('COMMIT');
    
//     let message = `Successfully assigned ${successCount} tasks.`;
//     if (duplicateCount > 0) {
//       message += ` ${duplicateCount} assignments were skipped (already assigned).`;
//     }
    
//     res.json({ 
//       success: true, 
//       message,
//       successCount,
//       duplicateCount,
//       totalAttempted: assignments.length
//     });
    
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Error in task assignment:', err);
//     res.status(500).json({ error: 'Failed to assign tasks. Please try again.' });
//   } finally {
//     client.release();
//   }
// });

// // Get assigned tasks for a specific employee (for MyTasks component)
// app.get('/api/my-tasks', authorize(['client']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT 
//         at.gid_no,
//         at.task_id,
//         at.deadline_days_left,
//         at.assigned_at,
//         at.completed_by_emp,
//         at.completed_by_manager,
//         t.task_name,
//         t.task_description,
//         t.task_link,
//         t.task_duration,
//         t.documents
//        FROM assigned_tasks at
//        JOIN task_table t ON at.task_id = t.task_id
//        WHERE at.gid_no = $1
//        ORDER BY at.assigned_at DESC`,
//       [req.user.gid_no]
//     );
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching assigned tasks:', err);
//     res.status(500).json({ error: 'Failed to fetch assigned tasks.' });
//   }
// });

// // Get all assigned tasks (for admin/team to review)
// app.get('/api/assigned-tasks', authorize(['admin', 'team']), async (req, res) => {
//   try {
//     let query = `
//       SELECT 
//         at.gid_no,
//         at.task_id,
//         at.deadline_days_left,
//         at.assigned_at,
//         at.completed_by_emp,
//         at.completed_by_manager,
//         t.task_name,
//         t.task_description,
//         t.task_link,
//         t.task_duration,
//         u.username,
//         u.email
//       FROM assigned_tasks at
//       JOIN task_table t ON at.task_id = t.task_id
//       JOIN users u ON at.gid_no = u.gid_no
//     `;
    
//     let params = [];
    
//     // If team member, only show tasks for their direct reports
//     if (req.user.role === 'team') {
//       query += ` WHERE u.reporting_manager_gid = $1`;
//       params.push(req.user.gid_no);
//     }
    
//     query += ` ORDER BY at.assigned_at DESC`;
    
//     const { rows } = await pool.query(query, params);
//     res.json(rows);
//   } catch (err) {
//     console.error('Error fetching assigned tasks:', err);
//     res.status(500).json({ error: 'Failed to fetch assigned tasks.' });
//   }
// });


// // Mark task as completed by employee (client)
// app.patch('/api/assigned-tasks/:gid_no/:task_id/complete', authorize(['client']), async (req, res) => {
//   const { gid_no, task_id } = req.params;
//   const { completed_by_emp } = req.body;

//   try {
//     const { rows } = await pool.query(
//       `UPDATE assigned_tasks 
//        SET completed_by_emp = $1, 
//            completed_at = CASE WHEN $1 THEN NOW() ELSE NULL END
//        WHERE gid_no = $2 AND task_id = $3
//        RETURNING *`,
//       [completed_by_emp, gid_no, task_id]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Task assignment not found' });
//     }

//     res.json({ success: true, assignment: rows[0] });
//   } catch (err) {
//     console.error('Error marking task complete:', err);
//     res.status(500).json({ error: 'Failed to mark task as complete.' });
//   }
// });

// Approve or reject a task (admin/team only)
// app.patch('/api/assigned-tasks/:gid_no/:task_id/approve', authorize(['admin', 'team']), async (req, res) => {
//   const { gid_no, task_id } = req.params;
//   const { completed_by_manager } = req.body;

//   try {
//     let query, params;
//     if (completed_by_manager === false) {
//       // On reject, also reset completed_by_emp and completed_at
//       query = `
//         UPDATE assigned_tasks
//         SET completed_by_manager = $1,
//             completed_by_emp = FALSE,
//             completed_at = NULL,
//             approved_at = NULL
//         WHERE gid_no = $2 AND task_id = $3
//         RETURNING *`;
//       params = [completed_by_manager, gid_no, task_id];
//     } else {
//       // On approve, only set completed_by_manager and approved_at
//       query = `
//         UPDATE assigned_tasks
//         SET completed_by_manager = $1,
//             approved_at = CASE WHEN $1 THEN NOW() ELSE NULL END
//         WHERE gid_no = $2 AND task_id = $3
//         RETURNING *`;
//       params = [completed_by_manager, gid_no, task_id];
//     }

//     const { rows } = await pool.query(query, params);

//     if (rows.length === 0) {
//       return res.status(404).json({ error: 'Task assignment not found' });
//     }

//     res.json({ success: true, assignment: rows[0] });
//   } catch (err) {
//     console.error('Error approving/rejecting task:', err);
//     res.status(500).json({ error: 'Failed to approve/reject task.' });
//   }
// });

// ///////////////////////////////////////////////////



const { router: taskManageCalls} = require('./task_manage_calls/task_manage_calls');
app.use('/api', taskManageCalls);


// ///////////////////////////////////////////////////

// // --- EMPLOYEE UI ENDPOINTS ---
// // Get all employee UI boxes
// app.get('/api/employee-ui', async (req, res) => {
//   try {
//     const { rows } = await pool.query('SELECT * FROM employee_ui ORDER BY task_id');
//     res.json(rows); // <-- This should be an array
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Add a new employee UI box
// app.post('/api/employee-ui', async (req, res) => {
//   const { task_type, task_name, task_icon, task_subtitle, is_application, application_id } = req.body;
//   try {
//     const { rows } = await pool.query(
//       `INSERT INTO employee_ui (task_type, task_name, task_icon, task_subtitle, is_application, application_id)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [task_type, task_name, task_icon, task_subtitle, is_application, application_id || null]
//     );
//     res.status(201).json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete an employee UI box
// app.delete('/api/employee-ui/:task_id', async (req, res) => {
//   const { task_id } = req.params;
//   try {
//     await pool.query('DELETE FROM employee_ui WHERE task_id = $1', [task_id]);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update an employee UI box
// app.put('/api/employee-ui/:task_id', async (req, res) => {
//   const { task_id } = req.params;
//   const { task_type, task_name, task_icon, task_subtitle, is_application, application_id } = req.body;
//   try {
//     const { rows } = await pool.query(
//       `UPDATE employee_ui
//        SET task_type = $1, task_name = $2, task_icon = $3, task_subtitle = $4, is_application = $5, application_id = $6
//        WHERE task_id = $7
//        RETURNING *`,
//       [task_type, task_name, task_icon, task_subtitle, is_application, application_id || null, task_id]
//     );
//     res.json(rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get steps for a UI box
// app.get('/api/employee-ui/:task_id/steps', async (req, res) => {
//   const { task_id } = req.params;
//   try {
//     const { rows } = await pool.query(
//       `SELECT * FROM employee_ui_steps WHERE task_id = $1 ORDER BY step_number`,
//       [task_id]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update all steps for a UI box (replace all steps)
// app.put('/api/employee-ui/:task_id/steps', async (req, res) => {
//   const { task_id } = req.params;
//   let { steps } = req.body; // [{step_number, step_title}]
//   const client = await pool.connect();
//   try {
//     // Filter out steps with empty or whitespace-only description/title
//     steps = steps.filter(
//       s => s.step_title && s.step_title.trim().length > 0
//     );

//     await client.query('BEGIN');
//     await client.query('DELETE FROM employee_ui_steps WHERE task_id = $1', [task_id]);
//     for (const step of steps) {
//       await client.query(
//         `INSERT INTO employee_ui_steps (task_id, step_number, description)
//          VALUES ($1, $2, $3)`,
//         [task_id, step.step_number, step.step_title]
//       );
//     }
//     await client.query('COMMIT');
//     res.json({ success: true });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({ error: err.message });
//   } finally {
//     client.release();
//   }
// });
// ///////////////////////////////////////////////////

const employeeUiEditCalls = require('./employee_ui_edit_calls/employee_ui_edit_calls');
app.use('/api', employeeUiEditCalls);


///////////////////////////////////////////////////
////////////////// --- ALARMS ENDPOINTS ---///////

// // Get all alarms (for admin view)
// app.get('/api/all-alarms', authorize(['admin']), async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       `SELECT 
//         aa.gid_no,
//         aa.access_id,
//         aa.deadline_date,
//         a.access_name,
//         u.username,
//         u.email
//        FROM access_alarm aa
//        JOIN access a ON aa.access_id = a.access_id
//        JOIN users u ON aa.gid_no = u.gid_no
//        LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
//        WHERE ua.access_id IS NULL
//        ORDER BY aa.deadline_date ASC, u.username`
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/api/alarms', authorize(['client']), async (req, res) => {
//   try {
//     const gid_no = req.user.gid_no;

//     // Pending access alarms (not yet granted)
//     const { rows: accessAlarms } = await pool.query(
//       `SELECT 
//         aa.access_id,
//         aa.deadline_date,
//         a.access_name,
//         'access' AS alarm_type
//        FROM access_alarm aa
//        JOIN access a ON aa.access_id = a.access_id
//        LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
//        WHERE aa.gid_no = $1
//          AND ua.access_id IS NULL
//        ORDER BY aa.deadline_date ASC`,
//       [gid_no]
//     );

//     // Pending offboard requests
//     const { rows: offboardAlarms } = await pool.query(
//       `SELECT 
//         NULL AS access_id,
//         r.created_at AS deadline_date,
//         'Offboard Request Pending' AS access_name,
//         'offboard' AS alarm_type
//        FROM offboard_requests r
//        WHERE r.client_id = (
//          SELECT user_id FROM users WHERE gid_no = $1
//        ) AND r.status = 'pending'
//        ORDER BY r.created_at DESC`,
//       [gid_no]
//     );

//     // Combine both types
//     const allAlarms = [...accessAlarms, ...offboardAlarms];

//     res.json(allAlarms);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get all pending alarms for employees reporting to the logged-in team manager
// app.get('/api/team-alarms', authorize(['team']), async (req, res) => {
//   try {
//     const managerGid = req.user.gid_no;
//     const { rows } = await pool.query(
//       `SELECT 
//         u.username AS client_name,
//         u.gid_no AS client_gid,
//         aa.access_id,
//         aa.deadline_date,
//         a.access_name
//        FROM access_alarm aa
//        JOIN access a ON aa.access_id = a.access_id
//        JOIN users u ON aa.gid_no = u.gid_no
//        LEFT JOIN user_access ua ON aa.gid_no = ua.gid_no AND aa.access_id = ua.access_id
//        WHERE ua.access_id IS NULL
//          AND u.role = 'client'
//          AND u.reporting_manager_gid = $1
//        ORDER BY aa.deadline_date ASC, u.username`,
//       [managerGid]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

////////////////////////////////////////////////////

const alarmCalls = require('./alarm_calls/alarm_calls');
app.use('/api', alarmCalls);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
