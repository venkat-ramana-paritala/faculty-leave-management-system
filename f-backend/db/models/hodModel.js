import mongoose from "mongoose";

const hodSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    department : {
        type : String,
        required : true,
        uppercase : true,
        unique : true
    },
    password: {
        type: String,
        required: true
    }
});

export default mongoose.model('HOD',hodSchema);
