import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({

    // ── WHO ──────────────────────────────────────────
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Required for Casual, optional for Extended
    substituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },

    // ── CATEGORY ─────────────────────────────────────
    // Inc 1: CASUAL only active. LONG scaffolded for Inc 3.
    category: {
        type: String,
        enum: ['CASUAL', 'EXTENDED'],
        required: true
    },

    // ── DATES ────────────────────────────────────────
    from: { type: Date, required: true },
    to:   { type: Date, required: true },

    // ── DURATION ─────────────────────────────────────
    // Inc 1: FULL only. HALF activated in Inc 2.
    durationType: {
        type: String,
        enum: ['FULL', 'HALF'],
        default: 'FULL'
    },
    halfDayPeriod: {
        type: String,
        enum: ['MORNING', 'AFTERNOON']
        // Required only when durationType = 'HALF'  — Inc 2
    },

    // ── REASON ───────────────────────────────────────
    reason: {
        type: String,
        required: true,
        trim: true
    },

    // ── TIMING ───────────────────────────────────────
    // Inc 1: BEFORE only. AFTER activated in Inc 2.
    applicationTiming: {
        type: String,
        enum: ['BEFORE', 'AFTER'],
        default: 'BEFORE'
    },

    // ── FORM TYPE ────────────────────────────────────
    // Inc 1: ONLINE only. OFFLINE activated in Inc 4.
    formType: {
        type: String,
        enum: ['ONLINE', 'OFFLINE'],
        default: 'ONLINE'
    },
    documentUrl: {
        type: String
        // Stores path to uploaded paper application
    },
    offlineEnteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
        // populated only if formType = 'OFFLINE'  — Inc 4
    },
    isBackdated: {
        type: Boolean,
        default: false
        // Inc 4
    },

    // ── CASUAL FIELDS ─────────────────────────────── (required when category=CASUAL)
    substituteStatus: {
        type: String,
        enum: ['PENDING', 'VALID', 'INVALID', 'REASSIGNMENT_REQUIRED'],
        default: 'PENDING'
    },
    // ── EXTENDED LEAVE FIELDS ────────────────────────── (Inc 3)
    extendedLeaveType: {
        type: String,
        enum: ['EARNED', 'HPL', 'MEDICAL', 'N/A'],
        default: 'N/A'
    },
    extendedLeaveBreakdown: {
        el_days:      { type: Number, default: 0 },
        hpl_days:     { type: Number, default: 0 },
        medical_days: { type: Number, default: 0 }
    },
    contactDetails: {
        address: String,
        phone:   String,
        mobile:  String,
        email:   String
    },

    // ── WORKFLOW STATE ───────────────────────────────
    currentStage: {
        type: String,
        enum: ['SUBSTITUTE', 'HOD', 'PRINCIPAL'],
        default: 'SUBSTITUTE'
    },
    status: {
        type: String,
        enum: ['PENDING', 'FORWARDED', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },

    // ── HOD DECISION ─────────────────────────────────
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // auto-populated at apply time
    },
    hodAction: {
        type: String,
        enum: ['FORWARDED', 'REJECTED']
    },
    hodRemarks:  String,
    hodActionAt: Date,

    // ── PRINCIPAL DECISION ───────────────────────────
    principalAction: {
        type: String,
        enum: ['APPROVED', 'REJECTED']
    },
    principalRemarks:  String,
    principalActionAt: Date,

    // ── AFTER-LEAVE CLASSIFICATION ───────────────── (Inc 2)
    absenceClassification: {
        type: String,
        enum: ['LWP', 'UNAUTHORIZED', 'N/A'],
        default: 'N/A'
    }

}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
