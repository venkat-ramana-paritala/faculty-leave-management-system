import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import HOD from '../db/models/hodModel.js';
import Faculty from '../db/models/facultyModel.js';
import Admin from '../db/adminModel/adminAuthModel.js';
async function authenticate(req,res,next){
    try{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({mssg:"Not authenticated"});
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    let user;
    if(decoded.role==='admin'){
        user = await Admin.findOne({admin_id : decoded.admin_id}).select('-password');
    }
    else if(decoded.role==='faculty'){
        user = await Faculty.findOne({faculty_code: decoded.faculty_code}).select('-password');
    }
    else if(decoded.role==='hod'){
        user = await HOD.findOne({department : decoded.department}).select('-password');
    }

    if(!user){
        return res.status(404).json({mssg:"User not found"});
    }

    req.user = user;
    req.role = decoded.role;

    next();
}
catch(err){
    return res.status(500).json({error : err.message});
}
}

export default authenticate;