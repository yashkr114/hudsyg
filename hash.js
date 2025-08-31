const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Hash a plain password
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Compare a plain password to a hash
async function comparePassword(plain, hash) {
  return await bcrypt.compare(plain, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
