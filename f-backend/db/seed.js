import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; // <--- 1. Import bcrypt
import mongoose from 'mongoose';
import connectDB from './database.js';
import adminAuth from './adminModel/adminAuthModel.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        // 2. Wait for DB connection
        await connectDB(); 

        const existingAdmin = await adminAuth.findOne({ admin_id: "admin" });
        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0); // 0 means "Success"
        }

        // 3. HASH THE PASSWORD (Security)
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);

        const admin = new adminAuth({
            admin_id: "admin",
            password: hashedPassword // <--- Save the Hash
        });

        // 4. WAIT for the save to finish
        await admin.save(); 
        
        console.log("Admin created successfully!");
        process.exit(0); // Exit with success code
    } catch (err) {
        // 5. Use console.error, not res.json
        console.error("Error seeding admin:", err.message);
        process.exit(1); // Exit with error code
    }
};

// 6. Actually run the function
seedAdmin();