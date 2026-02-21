import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config()

const URL = process.env.DB_URL;
if(!URL){
   console.error('Cannot access the database connection string');
}

const connectToDatabase = async ()=>{
   try{
   await mongoose.connect(URL);
   console.log("Connected to database successfully!");
   }
   catch(err){
      console.error("Error connecting Database");
   }
}

export default connectToDatabase;