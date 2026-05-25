/**
 * Run this ONCE to create the first SUPER_ADMIN account.
 * Usage:  node create-super-admin.js
 *
 * Edit the credentials below before running.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/maternal-system';

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, required: true },
}, { timestamps: true });

async function main() {
  // ── Edit these ──────────────────────────────────────────────────────────────
  const SUPER_ADMIN = {
    name:     'Super Admin',
    email:    'superadmin@moh.gov.et',
    password: 'SuperAdmin@123',
    role:     'SUPER_ADMIN',
  };
  // ────────────────────────────────────────────────────────────────────────────

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB:', MONGO_URI);

  const User = mongoose.model('User', UserSchema);

  const existing = await User.findOne({ email: SUPER_ADMIN.email });
  if (existing) {
    console.log(`\n⚠️  User already exists: ${SUPER_ADMIN.email} (role: ${existing.role})`);
    console.log('Delete it first or use a different email.\n');
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(SUPER_ADMIN.password, 10);
  await User.create({ ...SUPER_ADMIN, password: hashed });

  console.log('\n✅ SUPER_ADMIN created successfully!');
  console.log('─────────────────────────────────────');
  console.log(`  Email   : ${SUPER_ADMIN.email}`);
  console.log(`  Password: ${SUPER_ADMIN.password}`);
  console.log(`  Role    : ${SUPER_ADMIN.role}`);
  console.log(`  URL     : http://localhost:3000/auth`);
  console.log('─────────────────────────────────────\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
