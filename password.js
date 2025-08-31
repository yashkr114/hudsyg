// backend/password.js

// Function to generate a random password of given length
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'; // Allowed characters
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length)); // Pick a random character
  }
  return password; // Return the generated password
}

// Export the function for use in other files
module.exports = { generateRandomPassword };
