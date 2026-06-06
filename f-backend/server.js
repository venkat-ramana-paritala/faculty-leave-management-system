import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
const app = express();
import connectDB from './db/database.js';


import authRouter from './routes/authRoutes.js';
import facultyRouter from './routes/facultyRoutes.js';
import hodRouter from './routes/hodRoutes.js';
import principalRouter from './routes/principalRoutes.js';
import adminRouter from './routes/adminRoutes.js';

app.use(cors({
    origin : process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials : true,
    methods : ['GET','POST','PUT','DELETE']
}))

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.get('/',(req,res)=>{
    res.send('Cute Face!');
})

app.use('/auth',authRouter);
app.use('/faculty',facultyRouter);
app.use('/hod',hodRouter);
app.use('/principal',principalRouter);
app.use('/admin',adminRouter);

import User from './db/models/userModel.js';
import Department from './db/models/departmentModel.js';
import bcrypt from 'bcrypt';

app.listen(process.env.PORT, async () => {
    await connectDB();
    console.log(`server started at port ${process.env.PORT}`);

});