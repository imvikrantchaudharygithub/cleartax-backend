/**
 * Seed admin user
 * Run once: npx ts-node src/scripts/seedAdmin.ts
 *
 * Creates admin@gmail.com / admin123 with role: admin
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_PHONE = '9000000000'; // placeholder phone

async function seedAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Import model after connection
  const { User } = await import('../models/User.model');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      await User.updateOne({ email: ADMIN_EMAIL }, { role: 'admin' });
      console.log('✅ Existing user promoted to admin');
    } else {
      console.log('ℹ️  Admin user already exists — skipping');
    }
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    fullName: 'ClearTax Admin',
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log('✅ Admin user created successfully');
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
