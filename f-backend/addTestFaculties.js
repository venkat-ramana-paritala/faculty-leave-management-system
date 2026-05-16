import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './db/models/userModel.js';
import Department from './db/models/departmentModel.js';
import connectDB from './db/database.js';

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB.');

    // 1. Ensure CSE Dept exists
    let cse = await Department.findOne({ code: 'CSE' });
    if (!cse) {
      cse = await Department.create({ name: 'Computer Science and Engineering', code: 'CSE' });
      console.log('Created CSE Department.');
    } else {
      console.log('CSE Department exists.');
    }

    const hashedPass = await bcrypt.hash('faculty@123', 10);

    // 2. Create test1
    const test1 = await User.findOne({ email: 'test1@kitsw.ac.in' });
    if (!test1) {
      await User.create({
        name: 'Test Faculty 1',
        email: 'test1@kitsw.ac.in',
        facultyCode: 'TEST1',
        password: hashedPass,
        role: 'FACULTY',
        departmentId: cse._id,
        isActive: true
      });
      console.log('Created test1@kitsw.ac.in');
    } else {
      console.log('test1@kitsw.ac.in already exists.');
    }

    // 3. Create test2
    const test2 = await User.findOne({ email: 'test2@kitsw.ac.in' });
    if (!test2) {
      await User.create({
        name: 'Test Faculty 2',
        email: 'test2@kitsw.ac.in',
        facultyCode: 'TEST2',
        password: hashedPass,
        role: 'FACULTY',
        departmentId: cse._id,
        isActive: true
      });
      console.log('Created test2@kitsw.ac.in');
    } else {
      console.log('test2@kitsw.ac.in already exists.');
    }

    console.log('✅ Test faculties created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
