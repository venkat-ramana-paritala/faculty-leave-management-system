
import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import express from 'express';

const router = express.Router();

import User from '../db/models/userModel.js';
import Department from '../db/models/departmentModel.js';
import Admin from '../db/adminModel/adminAuthModel.js';
import authenticate from '../middleware/authMiddleware.js';

const isProd = process.env.NODE_ENV === 'production';

// ── UNIFIED LOGIN (Faculty / HOD / Principal) ────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ mssg: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) return res.status(404).json({ mssg: "User not found" });
        if (!user.isActive) return res.status(403).json({ mssg: "Account is deactivated" });

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(400).json({ mssg: "Invalid credentials" });
        }

        const payload = {
            role: user.role,
            userId: user._id
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            path: '/'
        });

        return res.status(200).json({
            mssg: "Login successful",
            role: user.role
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

// ── ADMIN LOGIN ──────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
    try {
        const { admin_id, password } = req.body;

        if (!admin_id || !password) {
            return res.status(400).json({
                mssg: "Admin ID and password are required"
            });
        }

        const admin = await Admin.findOne({ admin_id });

        if (!admin) {
            return res.status(404).json({
                mssg: "Admin not found"
            });
        }

        const isValid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!isValid) {
            return res.status(400).json({
                mssg: "Invalid credentials"
            });
        }

        const payload = {
            role: 'admin',
            adminId: admin._id
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            path: '/'
        });

        return res.status(200).json({
            mssg: "Admin login successful"
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
});

// ── UNIFIED LOGOUT ───────────────────────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {

    res.clearCookie('token', {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        path: '/'
    });

    return res.status(200).json({
        mssg: "Logged out successfully"
    });
});

export default router;

