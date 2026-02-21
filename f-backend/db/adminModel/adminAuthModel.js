import mongoose from 'mongoose';

const adminAuthSchema = new mongoose.Schema({
    admin_id : {
        type : String,
        unique : true,
        required : true
    },
    password : {
        type : String,
        required : true
    }
})

const adminAuth = mongoose.model('admin',adminAuthSchema);
export default adminAuth;