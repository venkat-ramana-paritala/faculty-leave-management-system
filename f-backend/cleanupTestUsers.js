import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './db/models/userModel.js';
import Leave from './db/models/leaveModel.js';
import connectDB from './db/database.js';

async function run() {
  try {
    await connectDB();
    console.log('Connected to DB.');

    const test1 = await User.findOne({ email: 'test1@kitsw.ac.in' });
    if (test1) {
        await Leave.deleteMany({ facultyId: test1._id });
        await Leave.deleteMany({ substituteId: test1._id });
        await User.findByIdAndDelete(test1._id);
        console.log('Cleaned up test1@kitsw.ac.in and associated leaves.');
    } else {
        console.log('test1@kitsw.ac.in not found.');
    }

    const test2 = await User.findOne({ email: 'test2@kitsw.ac.in' });
    if (test2) {
        await Leave.deleteMany({ facultyId: test2._id });
        await Leave.deleteMany({ substituteId: test2._id });
        await User.findByIdAndDelete(test2._id);
        console.log('Cleaned up test2@kitsw.ac.in and associated leaves.');
    } else {
        console.log('test2@kitsw.ac.in not found.');
    }

    console.log('✅ Test faculties and their leaves deleted successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
