import dotenv from 'dotenv'
dotenv.config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import Admin from '../db/adminModel/adminAuthModel.js';
import Faculty from '../db/models/facultyModel.js';
import HOD from '../db/models/hodModel.js';
import authenticate from '../middleware/authMiddleware.js';

router.post('/faculty/login',async (req,res)=>{
    try{
    const {faculty_code , password} = req.body;
    const fac = await Faculty.findOne({faculty_code : faculty_code});
    if(!fac){
        return res.status(404).json({mssg:"Faculty not found"});
    }
    const isValid = await bcrypt.compare(password,fac.password);
    if(!isValid){
        return res.status(400).json({mssg:"Invalid credentials"});
    }
    const payload = {
        role : 'faculty',
        faculty_code : fac.faculty_code
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn : '1d'
    })
    res.cookie('token',token,{
      httpOnly : true,
      sameSite : 'lax',
      secure : false,
      path : '/'
    })
    res.status(201).json({mssg:"faculty authentication successfull!"});
}
catch(err){
    return res.status(500).json({error : err.message});
}
})

router.post('/faculty/logout',authenticate,(req,res)=>{
    if(req.role!=='faculty'){
        return res.status(400).json({mssg:"Access denied, faculty only"})
    }
    res.clearCookie('token');
    res.status(200).json({mssg:"Logged out successfully"});
})

router.post('/admin/login',async (req,res)=>{
    try{
    const {admin_id,password} = req.body;
    const admin = await Admin.findOne({admin_id:admin_id});
    if(!admin){
        return res.status(404).json({mssg:"Admin not found"});
    }
    const isValid = await bcrypt.compare(password,admin.password);
    if(!isValid){
        return res.status(400).json({mssg:"Invalid credentials"});
    }
    const payload = {
        role : 'admin',
        admin_id : admin.admin_id
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn : '1d'
    })
    res.cookie('token',token,{
        httpOnly: true,
        sameSite : 'strict'
    })
    res.status(201).json({mssg:"admin authentication successfull!"});
}
catch(err){
    return res.status(500).json({error : err.message})
}
})

router.post('/admin/logout',authenticate, (req,res)=>{
    if(req.role!=='admin'){
        return res.status(400).json({mssg:"Access denied,admin only"});
    }
    res.clearCookie('token');
        res.status(200).json({mssg:"Logged out successfully"});
})

router.post('/hod/login',async (req,res)=>{
   try{
    const {department,password} = req.body;
    const hod = await HOD.findOne({department : department});
    if(!hod){
        return res.status(404).json({mssg:"HOD not found"});
    }
    const isValid = await bcrypt.compare(password,hod.password);
    if(!isValid){
        return res.status(400).json({mssg:"Invalid credentials"});
    }
    const payload = {
        role : 'hod',
        department : hod.department
    }
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn : '1d'
    });
    res.cookie('token',token,{
        httpOnly : true,
        sameSite : 'strict'
    });
    res.status(201).json({mssg:"HOD authentication successfull!"});
   }
   catch(err){
    return res.status(500).json({error : err.message});
   }
})

router.post('/hod/logout',authenticate, (req,res)=>{
    if(req.role!=='hod'){
        return res.status(400).json({mssg:"Access denied, hod only"});
    }
    res.clearCookie('token');  
      res.status(200).json({mssg:"Logged out successfully"});
})

export default router;