import express from 'express';
const router = express.Router();
import Leave from '../db/models/leavesModel.js';
import Faculty from '../db/models/facultyModel.js';
import HOD from '../db/models/hodModel.js';
import authenticate from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt';
router.use(authenticate);
router.use((req,res,next)=>{
    if(req.role!=='hod'){
        return res.status(400).json({mssg:"Access denied. hod only"});
    }
    next();
})
router.get('/home',async (req,res)=>{
    try{
        const pendingCount = await Leave.countDocuments({
            department_id : req.user._id,
            status : "Pending"
        });
        const recentTwo = await Leave.find({
            department_id : req.user._id,
            status : {$ne : "Pending"}
        }).sort({_id : -1}).limit(2).populate('faculty_id','name faculty_code -_id').populate('department_id','department -_id')

        const recTwo = recentTwo.map(r=>{
            return {
                from : r.from,
                to : r.to,
                type : r.type,
                status : r.status,
                faculty_name : r.faculty_id.name,
            }
        })

        res.status(200).json({
            pending_requests : pendingCount,
            recent_history : recTwo
        });
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})


router.put('/request/:leave_id',async (req,res)=>{
    try{
        const {leave_id} = req.params;
        const {status} = req.body;

        const leave = await Leave.findById(leave_id);
        if(!leave){
            return res.status(404).json({mssg:"Leave id not found"});
        }
        if(status==="Approved"){
            const fac = await Faculty.findById(leave.faculty_id);
            if(!fac){
                return res.status(404).json({mssg:"Faculty not found"});
            }
            if(leave.from>leave.to){
                return res.status(400).json({mssg:"Invalid dates applied for leave"})
            }
            const diff = Math.abs(new Date(leave.to)-new Date(leave.from));
            const daydiff = Math.ceil(diff/(1000*24*60*60))+1;
            if(daydiff>fac.leaves_left){
                return res.status(401).json({mssg:"Not enough leaves left to apply"});
            }
            fac.leaves_left = fac.leaves_left - daydiff;
            await fac.save();
        }
        leave.status = status;
        await leave.save();
        res.status(200).json({mssg:`Leave request ${status} successfully!`});
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

router.get("/pendingRequests",async (req,res)=>{
    try{
        const leave = await Leave.find({department_id : req.user._id,status: { $in: ["Pending"]} }).populate('faculty_id','name faculty_code');
        if(!leave||leave.length===0){
            return res.status(404).json({mssg:"No leaves history found"});
        }

        const leaves = leave.map(leave=>{
            return {
                from : leave.from,
                to : leave.to,
                type : leave.type,
                status : leave.status,
                faculty_name : leave.faculty_id.name,
                leave_id : leave._id
            }
        })

        res.status(200).json(leaves);
        
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.get("/requestHistory",async (req,res)=>{
    try{
        const leave = await Leave.find({department_id : req.user._id,status: { $in: ["Approved","Rejected"]} }).populate('faculty_id','name faculty_code');
        if(!leave||leave.length===0){
            return res.status(404).json({mssg:"No leaves history found"});
        }

        const leaves = leave.map(leave=>{
            return {
                from : leave.from,
                to : leave.to,
                type : leave.type,
                status : leave.status,
                faculty_name : leave.faculty_id.name
            }
        })

        res.status(200).json(leaves);
        
    }
    catch(err){
        return res.status(500).json({error : err.message});
    }
})

router.get("/getProfile", async (req,res)=>{
    try{
        const HOD = req.user;
        if(!HOD){
            return res.status(404).json({mssg:"HOD not found"});
        }
        const hod = {
            name : HOD.name,
            department : HOD.department
        }
        res.status(200).json(hod);
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

router.put("/profile",async (req,res)=>{
    try{
        const {name,password} = req.body;
        const updates = {};
        if(name){
            updates.name = name;
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password,10);
            updates.password = hashedPassword;
        }
        const hod = await HOD.findOneAndUpdate({department : req.user.department},
            updates,
            {new : true}
        );
        if(!hod){
            return res.status(404).json({mssg:"Couldn't fetch HOD details"})
        }
        res.status(200).json({mssg:"HOD details updated"})
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

export default router;