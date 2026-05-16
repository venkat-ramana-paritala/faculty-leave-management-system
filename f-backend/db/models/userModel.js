import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    // ── BASIC INFO ───────────────────────────────────
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },

    // facultyCode = login identifier for FACULTY and HOD
    // also printed on physical forms
    facultyCode: {
        type: String,
        uppercase: true,
        trim: true,
        sparse: true, // allows multiple null values (PRINCIPAL has no code)
        unique: true
    },

    // ── AUTH ─────────────────────────────────────────
    password: {
        type: String,
        required: true
    },

    // ── ROLE ─────────────────────────────────────────
    role: {
        type: String,
        enum: ['FACULTY', 'HOD', 'PRINCIPAL'],
        required: true
    },

    // ── DEPARTMENT ───────────────────────────────────
    // Required for FACULTY and HOD. Null for PRINCIPAL.
    // For HOD: this is the department they MANAGE.
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },

    // ── CASUAL LEAVE TRACKING ────────────────────────
    casualLeave: {
        total: {
            type: Number,
            default: 15
        },
        used: {
            type: Number,
            default: 0
        }
        // balance = total - used  (computed, never stored)
    },

    // ── LONG LEAVE CONFIG ────────────────────────────  (soft limits — Inc 3)
    longLeaveConfig: {
        earnedLeaveLimit: {
            type: Number,
            default: 5
        },
        hplLimit: {
            type: Number,
            default: 10
        }
    },

    // ── STATUS ───────────────────────────────────────
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
