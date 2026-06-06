import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import Leave from '../db/models/leaveModel.js';
import User from '../db/models/userModel.js';
import authenticate from '../middleware/authMiddleware.js';

router.use(authenticate);
router.use((req, res, next) => {
    if (req.role !== 'PRINCIPAL') {
        return res.status(403).json({ mssg: "Access denied. Principal only" });
    }
    next();
});

// ── GET /principal/home ──────────────────────────────────────────────────────
router.get('/home', async (req, res) => {
    try {
        const pendingCount = await Leave.countDocuments({
            status:       'FORWARDED',
            currentStage: 'PRINCIPAL'
        });

        const recent = await Leave.find({
            principalAction: { $in: ['APPROVED', 'REJECTED'] }
        })
            .sort({ principalActionAt: -1 })
            .limit(5)
            .populate('facultyId', 'name facultyCode')
            .populate('departmentId', 'name code')
            .lean();

        const recentResolved = recent.map(l => ({
            _id:               l._id,
            faculty:           l.facultyId,
            department:        l.departmentId,
            category:          l.category,
            extendedLeaveType: l.extendedLeaveType,
            from:              l.from,
            to:                l.to,
            reason:            l.reason,
            durationType:      l.durationType,
            halfDayPeriod:     l.halfDayPeriod,
            principalAction:   l.principalAction,
            principalActionAt: l.principalActionAt
        }));

        res.status(200).json({ pendingCount, recentResolved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /principal/pendingRequests ───────────────────────────────────────────
router.get('/pendingRequests', async (req, res) => {
    try {
        const leaves = await Leave.find({
            status:       'FORWARDED',
            currentStage: 'PRINCIPAL'
        })
            .sort({ createdAt: -1 })
            .populate('facultyId', 'name facultyCode email')
            .populate('departmentId', 'name code')
            .populate('substituteId', 'name facultyCode')
            .populate('hodId', 'name');

        if (leaves.length === 0) {
            return res.status(404).json({ mssg: "No pending requests" });
        }

        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /principal/request/:leaveId ─────────────────────────────────────────
router.put('/request/:leaveId', async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { action, remarks, absenceClassification } = req.body;

        if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ mssg: "Action must be APPROVED or REJECTED" });
        }
        if (!remarks || remarks.trim() === '') {
            return res.status(400).json({ mssg: "Remarks are required" });
        }

        const leave = await Leave.findById(leaveId);
        if (!leave) return res.status(404).json({ mssg: "Leave not found" });
        if (leave.status !== 'FORWARDED' || leave.currentStage !== 'PRINCIPAL') {
            return res.status(400).json({ mssg: "Leave is not pending Principal review" });
        }

        leave.principalAction    = action;
        leave.principalRemarks   = remarks.trim();
        leave.principalActionAt  = new Date();
        leave.status             = action === 'APPROVED' ? 'APPROVED' : 'REJECTED';

        if (action === 'REJECTED' && absenceClassification) {
            leave.absenceClassification = absenceClassification;
        }

        // Deduct leave balance on APPROVAL
        if (action === 'APPROVED' && leave.category === 'CASUAL') {
            const faculty = await User.findById(leave.facultyId);
            if (faculty) {
                const days = leave.durationType === 'HALF'
                    ? 0.5
                    : Math.floor((new Date(leave.to) - new Date(leave.from)) / (1000 * 60 * 60 * 24)) + 1;

                // Bug E Fix: Check if faculty has enough leave balance
                const currentBalance = (faculty.casualLeave.total || 15) - (faculty.casualLeave.used || 0);
                if (days > currentBalance) {
                    return res.status(400).json({ 
                        mssg: `Cannot approve: Faculty has only ${currentBalance} casual leave(s) remaining but this leave requires ${days} day(s).` 
                    });
                }

                faculty.casualLeave.used = (faculty.casualLeave.used || 0) + days;
                await faculty.save();
            }
        }

        await leave.save();
        res.status(200).json({ mssg: `Leave ${action.toLowerCase()} successfully` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /principal/requestHistory ────────────────────────────────────────────
router.get('/requestHistory', async (req, res) => {
    try {
        const leaves = await Leave.find({
            principalAction: { $in: ['APPROVED', 'REJECTED'] }
        })
            .sort({ principalActionAt: -1 })
            .populate('facultyId', 'name facultyCode')
            .populate('departmentId', 'name code')
            .populate('substituteId', 'name facultyCode');

        if (leaves.length === 0) {
            return res.status(404).json({ mssg: "No history found" });
        }

        const resolvedHistory = leaves.map(l => ({
            ...l.toObject(),
            durationType: l.durationType
        }));

        res.status(200).json(resolvedHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /principal/profile ───────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({ name: user.name, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /principal/profile ───────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ mssg: "Password is required" });
        const hashed = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.user._id, { password: hashed });
        res.status(200).json({ mssg: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
