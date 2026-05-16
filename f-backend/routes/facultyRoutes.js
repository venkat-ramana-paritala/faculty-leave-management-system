import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import Leave from '../db/models/leaveModel.js';
import User from '../db/models/userModel.js';
import authenticate from '../middleware/authMiddleware.js';

// All faculty routes: FACULTY, HOD, PRINCIPAL can access their own leave data
router.use(authenticate);
router.use((req, res, next) => {
    if (!['FACULTY', 'HOD', 'PRINCIPAL'].includes(req.role)) {
        return res.status(403).json({ mssg: "Access denied" });
    }
    next();
});

// ── GET /faculty/home ────────────────────────────────────────────────────────
router.get('/home', async (req, res) => {
    try {
        const user = req.user;
        
        // Safety check for initialized balances
        const casualTotal = user.casualLeave?.total || 12;
        const casualUsed = user.casualLeave?.used || 0;
        const casualBalance = casualTotal - casualUsed;

        const recentLeaves = await Leave.find({ facultyId: user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('substituteId', 'name facultyCode')
            .populate('departmentId', 'name code')
            .lean();

        const leaves = recentLeaves.map(l => ({
            _id: l._id,
            category: l.category,
            extendedLeaveType: l.extendedLeaveType,
            from: l.from,
            to: l.to,
            reason: l.reason,
            status: l.status,
            currentStage: l.currentStage,
            durationType: l.durationType,
            substituteStatus: l.substituteStatus,
            substitute: l.substituteId ? { name: l.substituteId.name, facultyCode: l.substituteId.facultyCode } : null
        }));

        res.status(200).json({
            name: user.name,
            casualLeave: {
                total: casualTotal,
                used: casualUsed,
                balance: casualBalance
            },
            recentLeaves: leaves
        });

    } catch (err) {
        console.error("Home Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ── POST /faculty/apply ──────────────────────────────────────────────────────
router.post('/apply', async (req, res) => {
    try {
        let { 
            category, 
            extendedLeaveType,
            from, 
            to, 
            reason, 
            substituteId, 
            durationType, 
            halfDayPeriod,
            contactDetails 
        } = req.body;

        const faculty = req.user;

        if (!from || !to || !reason) {
            return res.status(400).json({ mssg: "Missing required fields" });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        const today = new Date();
        today.setHours(0,0,0,0);
        fromDate.setHours(0,0,0,0);
        toDate.setHours(0,0,0,0);

        if (toDate < fromDate) {
            return res.status(400).json({ mssg: "To date cannot be before from date" });
        }

        // 1. Validate application timing (BEFORE/AFTER)
        const applicationTiming = fromDate < today ? 'AFTER' : 'BEFORE';
        
        // Calculate number of days
        const diffTime = Math.abs(toDate - fromDate);
        const numDays = durationType === 'HALF' ? 0.5 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Check if the applicant already has an overlapping leave
        const overlappingLeave = await Leave.findOne({
            facultyId: faculty._id,
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to:   { $gte: fromDate }
        });
        if (overlappingLeave) {
            return res.status(400).json({ mssg: "You already have a pending or approved leave during these dates." });
        }

        const newLeaveData = {
            facultyId: faculty._id,
            departmentId: faculty.departmentId,
            category,
            from: fromDate,
            to: toDate,
            reason,
            durationType: durationType || 'FULL',
            halfDayPeriod: durationType === 'HALF' ? halfDayPeriod : null,
            applicationTiming,
            status: 'PENDING'
        };

        if (category === 'CASUAL') {
            if (numDays > 5 && durationType === 'FULL') {
                return res.status(400).json({ mssg: "Casual leave cannot exceed 5 days" });
            }
            if (!substituteId) {
                return res.status(400).json({ mssg: "Substitute selection is mandatory for casual leave" });
            }
            if (String(substituteId) === String(faculty._id)) {
                return res.status(400).json({ mssg: "You cannot be your own substitute" });
            }

            const substitute = await User.findById(substituteId).populate('departmentId', 'code');
            if (!substitute || !substitute.isActive) {
                return res.status(404).json({ mssg: "Substitute not found or inactive" });
            }

            if (String(substitute.departmentId._id) !== String(faculty.departmentId._id)) {
                return res.status(400).json({ mssg: "Substitute must be from the same department" });
            }

            // Substitute availability check
            const substituteOnLeave = await Leave.findOne({
                facultyId: substituteId,
                status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
                from: { $lte: toDate },
                to:   { $gte: fromDate }
            });
            if (substituteOnLeave) {
                return res.status(400).json({ mssg: "Selected substitute is already on leave during those dates" });
            }

            const alreadyAssigned = await Leave.findOne({
                substituteId: substituteId,
                status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
                from: { $lte: toDate },
                to:   { $gte: fromDate }
            });
            if (alreadyAssigned) {
                return res.status(400).json({ mssg: "Selected substitute is already assigned for another leave during those dates" });
            }

            newLeaveData.substituteId = substituteId;
            newLeaveData.substituteStatus = 'PENDING';
            newLeaveData.currentStage = 'SUBSTITUTE';

        } else if (category === 'EXTENDED') {
            if (!extendedLeaveType) {
                return res.status(400).json({ mssg: "Extended leave type is required" });
            }

            if (extendedLeaveType === 'EARNED' && numDays > 7) {
                return res.status(400).json({ mssg: "Earned Leave cannot exceed 7 days" });
            }
            if (extendedLeaveType === 'HPL' && numDays > 8) {
                return res.status(400).json({ mssg: "Half Pay Leave cannot exceed 8 days" });
            }
            if (extendedLeaveType === 'MEDICAL' && numDays > 7) {
                return res.status(400).json({ mssg: "Medical Leave cannot exceed 7 days" });
            }

            const phoneRegex = /^[6-9]\d{9}$/;
            if (!contactDetails?.phone || !phoneRegex.test(contactDetails.phone)) {
                return res.status(400).json({ mssg: "Valid 10-digit phone number starting with 6-9 is required" });
            }

            newLeaveData.extendedLeaveType = extendedLeaveType;
            newLeaveData.contactDetails = contactDetails;
            newLeaveData.currentStage = 'HOD'; 
            newLeaveData.durationType = 'FULL'; 
        }

        const hod = await User.findOne({ departmentId: faculty.departmentId, role: 'HOD' });
        newLeaveData.hodId = hod ? hod._id : null;

        if (faculty.role === 'HOD') {
            newLeaveData.currentStage = 'PRINCIPAL';
            newLeaveData.status = 'FORWARDED';
            newLeaveData.hodAction = 'FORWARDED';
            newLeaveData.hodRemarks = 'Auto-forwarded (applicant is HOD)';
            newLeaveData.hodActionAt = new Date();
        }

        const newLeave = new Leave(newLeaveData);
        await newLeave.save();

        res.status(201).json({ mssg: "Leave applied successfully", days: numDays });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /faculty/substituteRequests ──────────────────────────────────────────
router.get('/substituteRequests', async (req, res) => {
    try {
        const leaves = await Leave.find({
            substituteId: req.user._id,
            substituteStatus: 'PENDING',
            currentStage: 'SUBSTITUTE',
            status: 'PENDING'
        })
            .sort({ createdAt: -1 })
            .populate('facultyId', 'name facultyCode email')
            .populate('departmentId', 'name code')
            .lean();

        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /faculty/substituteRequest/:leaveId ──────────────────────────────────
router.put('/substituteRequest/:leaveId', async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { action } = req.body; 

        if (!['ACCEPTED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ mssg: "Action must be ACCEPTED or REJECTED" });
        }

        const leave = await Leave.findById(leaveId);
        if (!leave) return res.status(404).json({ mssg: "Leave not found" });

        if (String(leave.substituteId) !== String(req.user._id)) {
            return res.status(403).json({ mssg: "Not authorized" });
        }

        if (leave.substituteStatus !== 'PENDING' || leave.currentStage !== 'SUBSTITUTE') {
            return res.status(400).json({ mssg: "Request is no longer pending" });
        }

        if (action === 'ACCEPTED') {
            leave.substituteStatus = 'VALID';
            leave.currentStage = 'HOD';
        } else {
            leave.substituteStatus = 'INVALID';
            leave.status = 'REJECTED'; 
        }

        await leave.save();
        res.status(200).json({ mssg: `Substitute request ${action.toLowerCase()} successfully` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /faculty/myLeaves ────────────────────────────────────────────────────
router.get('/myLeaves', async (req, res) => {
    try {
        const leaves = await Leave.find({ facultyId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('substituteId', 'name facultyCode')
            .populate('departmentId', 'name code')
            .lean();

        res.status(200).json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /faculty/availableSubstitutes ────────────────────────────────────────
router.get('/availableSubstitutes', async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) return res.status(400).json({ mssg: "Dates required" });

        const fromDate = new Date(from);
        const toDate = new Date(to);

        const substitutes = await User.find({
            departmentId: req.user.departmentId?._id || req.user.departmentId,
            role: 'FACULTY',
            _id: { $ne: req.user._id },
            isActive: true
        }).select('name facultyCode').lean();

        // Find IDs of faculty who are themselves on leave during these dates
        const unavailableIds = await Leave.find({
            facultyId: { $in: substitutes.map(s => s._id) },
            status: { $in: ['PENDING', 'FORWARDED', 'APPROVED'] },
            from: { $lte: toDate },
            to: { $gte: fromDate }
        }).distinct('facultyId');

        // Find IDs of faculty who are already assigned as a substitute during these dates
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

// ── GET /faculty/profile ─────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('departmentId', 'name code');
        if (!user) return res.status(404).json({ mssg: "User not found" });

        res.status(200).json({
            name:        user.name,
            email:       user.email,
            phone:       user.phone,
            facultyCode: user.facultyCode,
            role:        user.role,
            department:  user.departmentId,
            casualLeave: {
                total:   user.casualLeave.total,
                used:    user.casualLeave.used,
                balance: user.casualLeave.total - user.casualLeave.used
            },
            isActive: user.isActive
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /faculty/profile ─────────────────────────────────────────────────────
router.put('/profile', async (req, res) => {
    try {
        const { name, password } = req.body;
        const updates = {};
        if (name)     updates.name = name.trim();
        if (password) updates.password = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(req.user._id, updates);
        res.status(200).json({ mssg: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;