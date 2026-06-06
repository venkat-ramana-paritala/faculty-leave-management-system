import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import User from '../db/models/userModel.js';
import Department from '../db/models/departmentModel.js';
import Leave from '../db/models/leaveModel.js';
import Admin from '../db/adminModel/adminAuthModel.js';
import authenticate from '../middleware/authMiddleware.js';

router.use(authenticate);
router.use((req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({ mssg: "Access denied. Admin only" });
    }
    next();
});

// ── DEPARTMENTS ──────────────────────────────────────────────────────────────
router.get('/departments', async (req, res) => {
    try {
        const depts = await Department.find().sort({ code: 1 });
        res.status(200).json(depts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/departments', async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name || !code) return res.status(400).json({ mssg: "Name and code are required" });
        const exists = await Department.findOne({ code: code.toUpperCase() });
        if (exists) return res.status(400).json({ mssg: "Department code already exists" });
        const dept = new Department({ name, code });
        await dept.save();
        res.status(201).json({ mssg: "Department created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/departments/:code', async (req, res) => {
    try {
        const dept = await Department.findOneAndDelete({ code: req.params.code.toUpperCase() });
        if (!dept) return res.status(404).json({ mssg: "Department not found" });
        res.status(200).json({ mssg: "Department deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── FACULTY ──────────────────────────────────────────────────────────────────
router.get('/faculty', async (req, res) => {
    try {
        const faculty = await User.find({ role: { $in: ['FACULTY', 'HOD'] } })
            .select('-password')
            .populate('departmentId', 'name code')
            .sort({ name: 1 })
            .lean();
            
        if (faculty.length === 0) return res.status(404).json({ mssg: "No faculty found" });

        // Compute balance for each
        const results = faculty.map(f => ({
            ...f,
            casualLeave: {
                ...f.casualLeave,
                balance: (f.casualLeave.total || 0) - (f.casualLeave.used || 0)
            }
        }));

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/faculty', async (req, res) => {
    try {
        const { name, email, password, phone, facultyCode, departmentId } = req.body;
        if (!name || !email || !password || !facultyCode || !departmentId) {
            return res.status(400).json({ mssg: "name, email, password, facultyCode, departmentId are required" });
        }

        const dept = await Department.findById(departmentId);
        if (!dept) return res.status(404).json({ mssg: `Department not found` });

        const existing = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { facultyCode: facultyCode.toUpperCase() }]
        });
        if (existing) return res.status(400).json({ mssg: "Email or faculty code already in use" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            facultyCode: facultyCode.toUpperCase(),
            password: hashedPassword,
            role: 'FACULTY',
            departmentId: dept._id
        });
        await user.save();
        res.status(201).json({ mssg: "Faculty created successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/faculty/:facultyCode', async (req, res) => {
    try {
        const { name, phone, departmentId, isActive } = req.body;
        const faculty = await User.findOne({ facultyCode: req.params.facultyCode.toUpperCase() });
        if (!faculty) return res.status(404).json({ mssg: "Faculty not found" });

        if (name) faculty.name = name;
        if (phone) faculty.phone = phone;
        if (departmentId) faculty.departmentId = departmentId;
        if (isActive !== undefined) faculty.isActive = isActive;

        await faculty.save();
        res.status(200).json({ mssg: "Faculty updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/faculty/:facultyCode', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            facultyCode: req.params.facultyCode.toUpperCase(),
            role: 'FACULTY'
        });
        if (!user) return res.status(404).json({ mssg: "Faculty not found" });
        res.status(200).json({ mssg: "Faculty deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── HOD ──────────────────────────────────────────────────────────────────────
router.get('/hod', async (req, res) => {
    try {
        const hods = await User.find({ role: 'HOD' })
            .populate('departmentId', 'name code')
            .select('-password');
        res.status(200).json(hods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/hod', async (req, res) => {
    try {
        const { departmentId, facultyId } = req.body;
        if (!departmentId || !facultyId) {
            return res.status(400).json({ mssg: "departmentId and facultyId are required" });
        }

        // 1. Demote existing HOD if any
        await User.updateMany(
            { departmentId, role: 'HOD' },
            { $set: { role: 'FACULTY' } }
        );

        // 2. Promote new HOD
        const user = await User.findById(facultyId);
        if (!user) return res.status(404).json({ mssg: "User not found" });
        
        user.role = 'HOD';
        user.departmentId = departmentId;
        await user.save();

        res.status(200).json({ mssg: `Successfully assigned ${user.name} as HOD` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/hod/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ mssg: "HOD not found" });
        user.role = 'FACULTY';
        await user.save();
        res.status(200).json({ mssg: "HOD removed (demoted to Faculty)" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PRINCIPAL ────────────────────────────────────────────────────────────────
router.get('/principal', async (req, res) => {
    try {
        const principal = await User.findOne({ role: 'PRINCIPAL' }).select('-password');
        if (!principal) return res.status(404).json({ mssg: "Principal not found" });
        res.status(200).json(principal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/principal', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ mssg: "All fields required" });

        // Only one principal allowed
        await User.deleteMany({ role: 'PRINCIPAL' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const principal = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'PRINCIPAL'
        });
        await principal.save();
        res.status(201).json({ mssg: "Principal account created/replaced" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ALL LEAVES ───────────────────────────────────────────────────────────────
router.get('/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find()
            .sort({ createdAt: -1 })
            .populate('facultyId',    'name facultyCode')
            .populate('departmentId', 'name code')
            .populate('substituteId', 'name facultyCode');
        if (leaves.length === 0) return res.status(404).json({ mssg: "No leaves found" });
        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── OFFLINE LEAVE (MULTER) ───────────────────────────────────────────────────
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

router.post('/offline-leave', upload.single('document'), async (req, res) => {
    try {
        const { facultyId, from, to, reason, category, extendedLeaveType, durationType, halfDayPeriod, substituteId } = req.body;
        const file = req.file;

        if (!facultyId || !from || !to || !reason || !file) {
            return res.status(400).json({ mssg: "All fields and document are required" });
        }

        const faculty = await User.findById(facultyId);
        if (!faculty) return res.status(404).json({ mssg: "Faculty not found" });

        const fromDate = new Date(from);
        const toDate = new Date(to);
        fromDate.setHours(0,0,0,0);
        toDate.setHours(0,0,0,0);
        const diffTime = Math.abs(toDate - fromDate);
        const numDays = durationType === 'HALF' ? 0.5 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Bug C Fix: Check if faculty already has overlapping leave
        const overlappingLeave = await Leave.findOne({
            facultyId,
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to:   { $gte: fromDate }
        });
        if (overlappingLeave) {
            return res.status(400).json({ mssg: "This faculty already has a pending or approved leave during these dates." });
        }

        // Bug C Fix: Check if faculty is committed as substitute during these dates
        const substituteCommitment = await Leave.findOne({
            substituteId: facultyId,
            substituteStatus: 'VALID',
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to:   { $gte: fromDate }
        });
        if (substituteCommitment) {
            return res.status(400).json({ mssg: "This faculty is committed as a substitute during these dates." });
        }

        // Bug C Fix: If substitute is provided, validate substitute availability
        if (substituteId) {
            const subOnLeave = await Leave.findOne({
                facultyId: substituteId,
                status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
                from: { $lte: toDate },
                to:   { $gte: fromDate }
            });
            if (subOnLeave) {
                return res.status(400).json({ mssg: "Selected substitute is on leave during these dates." });
            }

            const subAssigned = await Leave.findOne({
                substituteId: substituteId,
                substituteStatus: 'VALID',
                status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
                from: { $lte: toDate },
                to:   { $gte: fromDate }
            });
            if (subAssigned) {
                return res.status(400).json({ mssg: "Selected substitute is already assigned for another leave during these dates." });
            }
        }

        // Auto-approve and deduct balance
        const newLeave = new Leave({
            facultyId,
            departmentId: faculty.departmentId,
            category: category || 'CASUAL',
            extendedLeaveType: extendedLeaveType || 'N/A',
            from: fromDate,
            to: toDate,
            reason,
            durationType: durationType || 'FULL',
            halfDayPeriod: durationType === 'HALF' ? halfDayPeriod : null,
            formType: 'OFFLINE',
            status: 'APPROVED',
            currentStage: 'PRINCIPAL',
            principalAction: 'APPROVED',
            principalActionAt: new Date(),
            principalRemarks: 'Entered by Admin (Offline)',
            documentUrl: file.path
        });

        if (category === 'CASUAL' && substituteId) {
            newLeave.substituteId = substituteId;
            newLeave.substituteStatus = 'VALID'; // Pre-approved since offline
        }

        await newLeave.save();

        // Deduct balance
        if (newLeave.category === 'CASUAL') {
            faculty.casualLeave.used = (faculty.casualLeave.used || 0) + numDays;
            await faculty.save();
        }

        res.status(201).json({ mssg: "Offline leave recorded and approved" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /admin/availableSubstitutes ──────────────────────────────────────────
router.get('/availableSubstitutes', async (req, res) => {
    try {
        const { departmentId, facultyId, from, to } = req.query;
        if (!departmentId || !facultyId || !from || !to) {
            return res.status(400).json({ mssg: "Department, Faculty, and Dates are required" });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        const substitutes = await User.find({
            departmentId: departmentId,
            role: { $in: ['FACULTY', 'HOD'] },
            _id: { $ne: facultyId },
            isActive: true
        }).select('name facultyCode').lean();

        const unavailableIds = await Leave.find({
            facultyId: { $in: substitutes.map(s => s._id) },
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to: { $gte: fromDate }
        }).distinct('facultyId');

        const assignedIds = await Leave.find({
            substituteId: { $in: substitutes.map(s => s._id) },
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to: { $gte: fromDate }
        }).distinct('substituteId');

        const excluded = new Set([...unavailableIds.map(String), ...assignedIds.map(String)]);
        const available = substitutes.filter(s => !excluded.has(String(s._id)));

        res.status(200).json(available);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN PROFILE ─────────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);
        if (!admin) return res.status(404).json({ mssg: "Admin not found" });
        res.status(200).json({ admin_id: admin.admin_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/profile', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ mssg: "Password is required" });
        const hashed = await bcrypt.hash(password, 10);
        await Admin.findByIdAndUpdate(req.user._id, { password: hashed });
        res.status(200).json({ mssg: "Password updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;