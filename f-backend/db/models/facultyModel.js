import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        trim : true
    },
    department:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'HOD',
        required : true
    },
    faculty_code:{
        type : String,
        unique : true,
        uppercase : true,
        required : true
    },
    leaves_left : {
        type : Number,
        default : 12
    },
    password : {
        type : String,
        required : true
    }
})

export default mongoose.model('Faculty',facultySchema);