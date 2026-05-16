import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from './database.js';
import adminAuth from './adminModel/adminAuthModel.js';
import User from './models/userModel.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to look for .env in the parent directory (f-backend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedAdminAndPrincipal = async () => {
    try {
        console.log("Connecting to Database...");
        await connectDB(); 

        // 1. Check and Seed Admin
        const existingAdmin = await adminAuth.findOne({ admin_id: "admin" });
        if (existingAdmin) {
            console.log("Admin already exists. Skipping Admin creation.");
        } else {
            console.log("Creating Admin...");
            const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
            const admin = new adminAuth({
                admin_id: "admin",
                password: hashedAdminPassword
            });
            await admin.save(); 
            console.log("Admin created successfully!");
        }

        // 2. Check and Seed Principal
        const existingPrincipal = await User.findOne({ role: "PRINCIPAL" });
        if (existingPrincipal) {
            console.log("Principal already exists. Skipping Principal creation.");
        } else {
            console.log("Creating Principal...");
            const hashedPrincipalPassword = await bcrypt.hash(process.env.PRINCIPAL_PASS, 10);
            const principal = new User({
                name: "Dr. K. Ashoka Reddy",
                email: "principal@kitsw.ac.in", // Use the email from the .env or standard format
                role: "PRINCIPAL",
                password: hashedPrincipalPassword
            });
            await principal.save();
            console.log("Principal created successfully!");
        }

        console.log("\n✅ Seeding complete!");
        process.exit(0); // Exit with success code
    } catch (err) {
        console.error("Error during seeding:", err.message);
        process.exit(1); // Exit with error code
    }
};

// Run the function
seedAdminAndPrincipal();