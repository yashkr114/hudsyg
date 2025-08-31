require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Common HTML wrapper for all emails
function wrapHtml(content, title = "Notification") {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">${title}</h2>
      </div>
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 0 0 8px 8px;">
        ${content}
        <p style="margin-top: 32px; color: #64748b;">Best regards,<br><strong>System Administration Team</strong></p>
      </div>
      <div style="background-color: #e5e7eb; padding: 12px; border-radius: 0 0 8px 8px; margin-top: 8px;">
        <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
}

function sendAccountEmail(to, username, password, gid_no) {
  const html = wrapHtml(`
    <p>Hello <strong>${username}</strong>,</p>
    <p>Your account has been created. Please find your credentials below:</p>
    <div style="background: #e0e7ff; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <p><strong>GID No.:</strong> ${gid_no}</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
    </div>
    <p>Please login and change your password as soon as possible.</p>
  `, "Welcome to the System");
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Account Credentials',
    html,
    text: `Hello ${username},\n\nYour account has been created.\nGID No.: ${gid_no}\nUsername: ${username}\nPassword: ${password}\n\nPlease login and change your password.`
  });
}

function sendOtpEmail(to, username, otp, gid_no) {
  const html = wrapHtml(`
    <p>Hello <strong>${username}</strong>,</p>
    <p>Your OTP for password reset is:</p>
    <div style="background: #fef9c3; padding: 16px; border-radius: 6px; margin: 16px 0; text-align: center;">
      <span style="font-size: 1.5em; font-weight: bold; color: #ca8a04;">${otp}</span>
    </div>
    <p><strong>GID No.:</strong> ${gid_no}</p>
    <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
  `, "Password Reset OTP");
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset OTP',
    html,
    text: `Hello ${username},\n\nYour OTP for password reset is: ${otp}\nGID No.: ${gid_no}\n\nThis OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.`
  });
}

function sendOffboardRequestToManager(managerEmail, clientInfo, accessList, notes) {
  const { name, gid, vmo2gid, email } = clientInfo;
  const html = wrapHtml(`
    <p>Hello,</p>
    <p>You have received an <strong>offboarding request</strong> for the following client:</p>
    <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>GID:</strong> ${gid}</p>
      <p><strong>Email:</strong> ${email}</p>
    </div>
    <p><strong>Current Access:</strong></p>
    <ul style="background: #e0f2fe; padding: 12px; border-radius: 6px;">
      ${accessList.map(a => `<li>${a}</li>`).join('')}
    </ul>
    <p><strong>Additional Notes:</strong> ${notes || 'None'}</p>
    <p>Please review and take action in your dashboard.</p>
  `, "Offboarding Request Notification");
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: managerEmail,
    subject: `Offboarding Request for ${name}`,
    html,
    text: `Hello,\n\nYou have received an offboarding request for the following client:\n\nName: ${name}\nGID: ${gid}\nEmail: ${email}\n\nCurrent Access:\n${accessList.map(a => '- ' + a).join('\n')}\n\nAdditional Notes: ${notes || 'None'}\n\nPlease review and take action in your dashboard.\n\nThank you.`
  });
}

function sendOffboardStatusToClient(clientEmail, status, managerName, notes) {
  const html = wrapHtml(`
    <p>Hello,</p>
    <p>Your offboarding request has been <strong style="color:${status === 'accepted' ? '#16a34a' : '#dc2626'}">${status}</strong> by your reporting manager (<strong>${managerName}</strong>).</p>
    ${notes ? `<div style="background: #fef9c3; padding: 12px; border-radius: 6px; margin: 16px 0;"><strong>Manager notes:</strong> ${notes}</div>` : ''}
    <p>If you have questions, please contact your manager.</p>
  `, "Offboarding Request Status");
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: `Your Offboarding Request has been ${status}`,
    html,
    text: `Hello,\n\nYour offboarding request has been ${status} by your reporting manager (${managerName}).\n\n${notes ? 'Manager notes: ' + notes + '\n\n' : ''}If you have questions, please contact your manager.\n\nThank you.`
  });
}

function sendTeamOffboardNotification(to, username, gid_no, adminName) {
  const html = wrapHtml(`
    <p>Dear <strong>${username}</strong>,</p>
    <p>We are writing to inform you that your team member account has been <span style="color:#dc2626;font-weight:bold;">offboarded</span> from our system.</p>
    <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 16px 0;">
      <p><strong>Name:</strong> ${username}</p>
      <p><strong>GID Number:</strong> ${gid_no}</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Offboarded by:</strong> ${adminName}</p>
    </div>
    <div style="background: #fef9c3; border: 1px solid #fde68a; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #b45309;">Important Information:</h4>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Your account access has been revoked</li>
        <li>All system permissions have been removed</li>
        <li>Please return any company equipment or materials</li>
        <li>Contact HR if you have any questions about final procedures</li>
      </ul>
    </div>
    <p>If you believe this action was taken in error, please contact your administrator immediately.</p>
  `, "Account Offboarding Notification");
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Account Offboarding Notification',
    html,
    text: `Dear ${username},

We are writing to inform you that your team member account has been offboarded from our system.

Account Details:
- Name: ${username}
- GID Number: ${gid_no}
- Email: ${to}
- Offboarded by: ${adminName}

Important Information:
- Your account access has been revoked
- All system permissions have been removed
- Please return any company equipment or materials
- Contact HR if you have any questions about final procedures

If you believe this action was taken in error, please contact your administrator immediately.

Best regards,
System Administration Team

This is an automated notification. Please do not reply to this email.`
  });
}

module.exports = { 
  sendAccountEmail, 
  sendOtpEmail, 
  sendOffboardRequestToManager, 
  sendOffboardStatusToClient,
  sendTeamOffboardNotification 
};
