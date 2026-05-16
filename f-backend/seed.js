import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './db/models/userModel.js';
import Department from './db/models/departmentModel.js';
import Admin from './db/adminModel/adminAuthModel.js';

const MONGODB_URI = process.env.DB_URL;

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Clear existing data to prevent duplicates during testing
    console.log('Clearing existing records...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Admin.deleteMany({});

    // 2. Create Admin
    console.log('Creating Admin...');
    const adminPass = await bcrypt.hash('admin@123', 10);
    await Admin.create({
      admin_id: 'admin',
      password: adminPass
    });

    // 3. Create Principal
    console.log('Creating Principal...');
    const principalPass = await bcrypt.hash('principal@123', 10);
    await User.create({
      name: 'Dr. Principal Name',
      email: 'principal@college.edu',
      role: 'PRINCIPAL',
      password: principalPass
    });

    // 4. Create Department
    console.log('Creating Department (CSE)...');
    const cseDept = await Department.create({
      name: 'Computer Science and Engineering',
      code: 'CSE'
    });

    // 5. Create HOD
    console.log('Creating HOD for CSE...');
    const hodPass = await bcrypt.hash('hod@123', 10);
    await User.create({
      name: 'Dr. HOD Name',
      email: 'hod.cse@college.edu',
      facultyCode: 'HOD001',
      role: 'HOD',
      departmentId: cseDept._id,
      password: hodPass
    });

    // 6. Create Faculties
    console.log('Creating Faculty members...');
    const facPass = await bcrypt.hash('fac@123', 10);
    
    await User.create({
      name: 'Prof. John Doe',
      email: 'johndoe@college.edu',
      facultyCode: 'FAC001',
      role: 'FACULTY',
      departmentId: cseDept._id,
      password: facPass
    });

    await User.create({
      name: 'Prof. Jane Smith',
      email: 'janesmith@college.edu',
      facultyCode: 'FAC002',
      role: 'FACULTY',
      departmentId: cseDept._id,
      password: facPass
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('──────────────────────────────────────────────────');
    console.log('Here are the login credentials for testing:');
    console.log('--- ADMIN ---');
    console.log('ID: admin');
    console.log('Pass: admin@123\n');
    console.log('--- PRINCIPAL ---');
    console.log('Email: principal@college.edu');
    console.log('Pass: principal@123\n');
    console.log('--- HOD ---');
    console.log('Email: hod.cse@college.edu  OR Code: HOD001');
    console.log('Pass: hod@123\n');
    console.log('--- FACULTY ---');
    console.log('Email: johndoe@college.edu OR Code: FAC001');
    console.log('Pass: fac@123');
    console.log('──────────────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
