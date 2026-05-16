import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import Leave from '../db/models/leaveModel.js';
import User from '../db/models/userModel.js';
import authenticate from '../middleware/authMiddleware.js';

router.use(authenticate);
router.use((req, res, next) => {
    if (req.role !== 'HOD') {
        return res.status(403).json({ mssg: "Access denied. HOD only" });
    }
    next();
});

// ── GET /hod/home ────────────────────────────────────────────────────────────
router.get('/home', async (req, res) => {
    try {
        const pendingCount = await Leave.countDocuments({
            departmentId:  req.user.departmentId,
            currentStage:  'HOD',
            status:        'PENDING'
        });

        const recent = await Leave.find({
            departmentId: req.user.departmentId,
            hodAction:    { $in: ['FORWARDED', 'REJECTED'] }
        })
            .sort({ hodActionAt: -1 })
            .limit(5)
            .populate('facultyId', 'name facultyCode')
            .populate('substituteId', 'name facultyCode')
            .lean();

        const recentResolved = recent.map(l => ({
            _id:          l._id,
            faculty:      l.facultyId,
            category:     l.category,
            from:         l.from,
            to:           l.to,
            durationType: l.durationType,
            status:       l.status,
            hodAction:    l.hodAction,
            hodActionAt:  l.hodActionAt,
            substitute:   l.substituteId
        }));

        res.status(200).json({ pendingCount, recentResolved });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /hod/pendingRequests ─────────────────────────────────────────────────
router.get('/pendingRequests', async (req, res) => {
    try {
        const leaves = await Leave.find({
            departmentId: req.user.departmentId,
            currentStage: 'HOD',
            status:       'PENDING'
        })
            .sort({ createdAt: -1 })
            .populate('facultyId', 'name facultyCode email')
            .populate('substituteId', 'name facultyCode');

        if (leaves.length === 0) {
            return res.status(404).json({ mssg: "No pending requests" });
        }

        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /hod/request/:leaveId ────────────────────────────────────────────────
router.put('/request/:leaveId', async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { action, remarks } = req.body;

        if (!action || !['FORWARDED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ mssg: "Action must be FORWARDED or REJECTED" });
        }
        if (!remarks || remarks.trim() === '') {
            return res.status(400).json({ mssg: "Remarks are required" });
        }

        const leave = await Leave.findById(leaveId);
        if (!leave) return res.status(404).json({ mssg: "Leave not found" });

        // Security: must belong to this HOD's department
        if (String(leave.departmentId) !== String(req.user.departmentId._id)) {
            return res.status(403).json({ mssg: "This leave is not from your department" });
        }
        if (leave.status !== 'PENDING' || leave.currentStage !== 'HOD') {
            return res.status(400).json({ mssg: "Leave is not pending HOD review" });
        }

        leave.hodAction   = action;
        leave.hodRemarks  = remarks.trim();
        leave.hodActionAt = new Date();

        if (action === 'FORWARDED') {
            leave.status       = 'FORWARDED';
            leave.currentStage = 'PRINCIPAL';
        } else {
            leave.status = 'REJECTED';
        }

        await leave.save();
        res.status(200).json({ mssg: `Leave ${action.toLowerCase()} successfully` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /hod/requestHistory ──────────────────────────────────────────────────
router.get('/requestHistory', async (req, res) => {
    try {
        const leaves = await Leave.find({
            departmentId: req.user.departmentId,
            hodAction:    { $in: ['FORWARDED', 'REJECTED'] }
        })
            .sort({ hodActionAt: -1 })
            .populate('facultyId', 'name facultyCode')
            .populate('substituteId', 'name facultyCode');

        if (leaves.length === 0) {
            return res.status(404).json({ mssg: "No history found" });
        }

        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /hod/profile ─────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('departmentId', 'name code');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /hod/profile ─────────────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
    try {
        const { name, password } = req.body;
        const updates = {};
        if (name)     updates.name = name.trim();
        if (password) updates.password = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.user._id, updates);
        res.status(200).json({ mssg: "Profile updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;