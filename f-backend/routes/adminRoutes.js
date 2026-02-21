import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const router = express.Router();
import HOD from '../db/models/hodModel.js';
import Faculty from '../db/models/facultyModel.js';
import Leave from '../db/models/leavesModel.js';
import bcrypt from 'bcrypt';
import authenticate from '../middleware/authMiddleware.js';
import Admin from '../db/adminModel/adminAuthModel.js';

router.use(authenticate);

router.use((req,res,next)=>{
    if(req.role!=='admin'){
        return res.status(400).json({mssg:"Access denied. Admin only"});
    }
    next(); 
})

router.get('/faculty',async (req,res)=>{
    try{
        
        const fac = await Faculty.find().select('-password').populate('department','department -_id');
        if(fac.length===0){
            return res.status(404).json({mssg:"No faculty in the list"});
        }
        const cleanFac = fac.map(f=>{
            return {
                name : f.name,
                faculty_code : f.faculty_code,
                leaves_left : f.leaves_left,
                department : f.department.department
            }
        })
        res.status(200).json(cleanFac);
    }
    catch(err){
        return res.status(500).json({error: err.message});
    }
})

router.get('/faculty/:faculty_code',async (req,res)=>{
    try{
       
       const faculty_code = req.params.faculty_code;
       const fac = await Faculty.findOne({faculty_code : faculty_code}).select('-password').populate('department','department -_id');
       if(!fac){
        return res.status(404).json({mssg:"No faculty exists with that faculty code"})
       }
       const faculty = {
            _id : fac._id,
            name : fac.name,
            faculty_code : fac.faculty_code,
            leaves_left : fac.leaves_left,
            department : fac.department.department
        }
       
       res.status(200).json(faculty);
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.post('/faculty', async (req,res)=>{
    try{
        
    const {name,department,faculty_code} = req.body;
    const newFac = await Faculty.findOne({faculty_code : faculty_code});
    if(newFac){
        return res.status(400).json({mssg:"Faculty with that code already exists"});
    }
    const dept = await HOD.findOne({department : department});
    if(!dept){
        return res.status(404).json({mssg:"Department not found"});
    }
    const hashedPassword = await bcrypt.hash(process.env.FAC_PASS,10);
    const fac = new Faculty({
        name : name,
        department : dept._id,
        faculty_code : faculty_code,
        leaves_left : 12,
        password : hashedPassword
    })
    await fac.save();
    res.status(201).json({mssg:"Faculty created successfully"});
}
catch(err){
    return res.status(500).json({error : err.message});
}
})

router.put('/faculty/:faculty_code',async (req,res)=>{
    try{
       
        const {faculty_code} = req.params;
        const {name,leaves_left} = req.body;
        const faculty = await Faculty.findOneAndUpdate({faculty_code:faculty_code},{name:name , leaves_left:leaves_left},{new : true});
        if(!faculty){
            return res.status(404).json({mssg:"Cannot find faculty"});
        }
        res.status(201).json({mssg:"Faculty details updated!"});
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.delete('/faculty/:faculty_code',async (req,res)=>{
    try{
        
    const {faculty_code} = req.params;
    const fac = await Faculty.findOneAndDelete({faculty_code : faculty_code});
    if(!fac){
        return res.status(404).json({mssg:"Faculty not found to delete"});
    }
    res.status(200).json({mssg:"faculty deleted successfully!"});
}
catch(err){
    return res.status(500).json({error : err.message});
}
})

router.get('/hod', async (req,res)=>{
     try{
        
        const allHOD = await HOD.find().select('-password').select('-_id');
        if(allHOD.length===0){
            return res.status(404).json({mssg:"No HOD's in the list"});
        }
        res.status(200).json(allHOD);
     }
     catch(err){
        res.status(500).json({error : err.message});
     }
})

router.get('/hod/:dept_code', async (req,res)=>{
    try{
        
    const department = req.params.dept_code;
    const hod = await HOD.findOne({department : department}).select('-password');
    if(!hod){
        return res.status(404).json({mssg:"HOD not found with that Dept."});
    }
    res.status(200).json(hod);
}
catch(err){
    return res.status(500).json({error : err.message});
}
})

router.post('/hod',async (req,res)=>{
    try{
        
    const {name, department} = req.body;
    const isPresent = await HOD.findOne({department : department});
    if(isPresent){
        return res.status(400).json({mssg : "Department already exists"});
    }
    const hashedPassword = await bcrypt.hash(process.env.HOD_PASS,10);
    const newHOD = new HOD({
        name : name,
        department : department,
        password : hashedPassword
    })
    await newHOD.save()
    res.status(201).json({mssg: "Hod created successfully! "});
}
catch(err){
    res.status(500).json({error : err.message});
}
})

router.put('/hod/:dept_code',async (req,res)=>{
    try{
    const {dept_code} = req.params;
    const {name} = req.body;
     const hod = await HOD.findOneAndUpdate({department: dept_code},{
        name:name
     });
     if(!hod){
        return res.status(404).json({mssg:"cannot find HOD"});
     }
     res.status(201).json({mssg:"HOD details updated sucessfully"});
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.delete('/hod/:dept_code',async (req,res)=>{
    try{
       const dept_code = req.params.dept_code;
       const hod = await HOD.findOneAndDelete({department : dept_code});
       if(!hod){
        return res.status(404).json({mssg:"HOD not found to delete"});
       }
       res.status(200).json({mssg:"HOD deleted successfully"});
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

router.get('/leaves',async (req,res)=>{
    try{
        const l =await Leave.find().populate('faculty_id','faculty_code department leaves_left -_id').populate('department_id','department -_id').sort({id : -1});
        if(!l||l.length===0){
            return res.status(404).json({mssg:"No leaves found"});
        }
       const leave = l.map(l=>{
        return {
        faculty_code : l.faculty_id?l.faculty_id.faculty_code:"deleted faculty",
        department : l.department_id?l.department_id.department:"unknown department",
        status : l.status,
        from : l.from.toLocaleDateString(),
        to : l.to.toLocaleDateString(),
        type : l.type
        }
       })
       res.status(200).json(leave);
    }
    catch(err){
    return res.status(500).json({error : err.message});
    }
})

router.get('/leaves/:dept_code', async (req,res)=>{
    try{
        const dept_code = req.params.dept_code;
        const dep = await HOD.findOne({department : dept_code});
        if(!dep){
            return res.status(404).json({mssg:"Department not found"});
        }
        const l = await Leave.find({department_id : dep._id})
            .populate('faculty_id','faculty_code department -_id')
            .populate('department_id','department -_id');
        if(!l||l.length===0){
            return res.status(200).json({mssg:"No leaves from your department"});
        }
        const leaves = l.map(item => ({
            _id: item._id,
            faculty_code: item.faculty_id?item.faculty_id.faculty_code:"deleted faculty",
            department: item.department_id?item.department_id.department:"Unknown department",
            status: item.status,
            from: item.from,
            to: item.to,
            type: item.type
        }));
        res.status(200).json(leaves);
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.get('/getProfile',async (req,res)=>{
    try{
        const admin = await Admin.findOne({_id : req.user._id});
        if(!admin){
            return res.status(404).json({mssg:"Admin not found"});
        }
       const a = {
        admin_id : admin.admin_id
       }
        res.status(201).json(a);
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

router.put("/profile",async (req,res)=>{
    try{
        const {pass} = req.body;
        if(!pass){
            return res.status(400).json({mssg:"Enter valid password"});
        }
        const hashedPassword = await bcrypt.hash(pass,10);
        const admin = await Admin.findOneAndUpdate({_id : req.user._id},{
            password : hashedPassword
        });
        res.status(200).json({mssg:"Password changed successfully"});
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

export default router;