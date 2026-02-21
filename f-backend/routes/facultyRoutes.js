import express from 'express';
import Leave from '../db/models/leavesModel.js';
import Faculty from '../db/models/facultyModel.js';
import authenticate from '../middleware/authMiddleware.js';
import bcrypt from 'bcrypt'

const router = express.Router();
router.use(authenticate);

router.use((req,res,next)=>{
    if(req.role!=='faculty'){
        return res.status(400).json({mssg:"Access denied, faculty only"});
    }
    next();
})

router.get('/home',async (req,res)=>{
    try{
        const total = 12;
        const left = req.user.leaves_left;
        const used = total-left;
        const updated = {}
        updated.total = total;
        updated.left = left;
        updated.used = used;

        const leave = await Leave.find({faculty_id:req.user._id}).sort({_id : -1}).limit(2).populate('department_id','department');

        if(leave.length>0){
           updated.leave = leave.map(l=>{
            return {
                from : l.from,
                to : l.to,
                type : l.type,
                status : l.status
            }
           });
        }
        res.status(200).json(updated);
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})

router.post('/apply', async (req,res)=>{
    try{
        console.log("RECEIVED BODY:", req.body);
        console.log("Type of from:", typeof req.body.from);
        console.log("Value of from:", req.body.from);
       const {from,to,type} = req.body;
       if(!from || !to || !type){
           return res.status(400).json({message: "Missing required fields"});
       }

       const faculty = req.user;
       if(!faculty){
        return res.status(404).json({message : "Faculty not found"});
       }

       const fromDate = new Date(from);
       const toDate = new Date(to);
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return res.status(400).json({ message: "Invalid dates" });
}

       const today = new Date();
       today.setHours(0,0,0,0);
       fromDate.setHours(0,0,0,0);
       toDate.setHours(0,0,0,0);
       if(fromDate<today||toDate<today){
        return res.status(400).json({message:"You can't apply leaves for past"});
       }


       const msPerDay = 24*60*60*1000;
       const utcFrom = Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
       const utcTo = Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
       const numberOfDays = Math.floor((utcTo - utcFrom)/msPerDay) + 1;
       if(numberOfDays <= 0){
           return res.status(400).json({message: "'to' date must be same or after 'from' date"});
       }
       if(numberOfDays>5){
        return res.status(400).json({mssg:"You cannot apply leave for more than 5 days"});
       }
       if(numberOfDays > faculty.leaves_left){
           return res.status(400).json({message: "Insufficient leave balance"});
       }

       const newLeave = new Leave({
           faculty_id : faculty._id,
           department_id : faculty.department,
           status : 'Pending',
           from : fromDate,
           to : toDate,
           type : type
       })
       await newLeave.save()
       // do not deduct leaves until approval
       res.status(201).json({ 
               message: "Leave applied successfully!", 
               days: numberOfDays, 
               remaining: faculty.leaves_left 
           });
    }
    catch(err){
        console.log("CRITICAL ERROR:", err);
        res.status(500).json({message : "Server error ", error : err.message});
    }

});

router.get('/myLeaves', async (req, res) => {
  try {
    const leave = await Leave.find({ faculty_id: req.user._id })
      .sort({ _id: -1 })
      .select('from to type status')
      .lean();

    if (leave.length === 0) {
      return res.status(404).json({ mssg: "No leaves taken yet" });
    }

    const leaves = leave.map(l => ({
      from: new Date(l.from),
      to: new Date(l.to),
      type: l.type,
      status: l.status
    }));

    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profileData',async (req,res)=>{
    try{
       
       const faculty_code = req.user.faculty_code;
       const fac = await Faculty.findOne({faculty_code : faculty_code}).select('-password').populate('department','department -_id');
       if(!fac){
        return res.status(404).json({mssg:"No faculty exists with that faculty code"})
       }
       const faculty = {
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


router.put("/profile",async (req,res)=>{
    try{
        const {name,password} = req.body;
        const updated={}
        if(name){
            updated.name = name;
        }
        if(password){
            const hashedPassword = await bcrypt.hash(password,10);
            updated.password = hashedPassword;
        }
        const fac = await Faculty.findOneAndUpdate({faculty_code:req.user.faculty_code},updated,{new : true});
        if(!fac){
            return res.status(404).json({mssg:"faculty not found, please try again later"});
        }
        res.status(200).json({mssg:"Faculty details updated successfully"});
    }
    catch(err){
        res.status(500).json({error : err.message});
    }
})


export default router;