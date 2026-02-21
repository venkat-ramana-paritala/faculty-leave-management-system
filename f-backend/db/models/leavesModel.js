import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema({
    faculty_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Faculty',
        required : true
    },
    department_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'HOD',
        required : true
    },
    status : {
        type : String,
        enum : ['Approved','Pending','Rejected'],
        default : 'Pending'
    },
    from : {
        type : Date,
        required : true
    },
    to : {
        type : Date,
        required : true
    },
    type : {
        type : String,
        enum : ['Casual','Medical','Paid'],
        required : true
    }
})

export default mongoose.model('Leave',leaveSchema);