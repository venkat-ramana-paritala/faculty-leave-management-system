import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import User from '../db/models/userModel.js';
import Admin from '../db/adminModel/adminAuthModel.js';

async function authenticate(req, res, next) {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ mssg: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;

        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.adminId).select('-password');
        } else {
            // FACULTY, HOD, PRINCIPAL — all in User model
            user = await User.findById(decoded.userId)
                .select('-password')
                .populate('departmentId', 'name code');
        }

        if (!user) {
            return res.status(404).json({ mssg: "User not found" });
        }

        if (decoded.role !== 'admin' && user.isActive === false) {
            return res.status(403).json({ mssg: "Account is deactivated" });
        }

        req.user = user;
        req.role  = decoded.role; // 'FACULTY' | 'HOD' | 'PRINCIPAL' | 'admin'
        next();

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export default authenticate;