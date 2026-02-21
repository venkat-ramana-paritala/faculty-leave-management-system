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
import adminRouter from './routes/adminRoutes.js';

app.use(cors({
    origin : 'http://localhost:5500',
    credentials : true,
    methods : ['GET','POST','PUT','DELETE']
}))

app.use(express.json());
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send('Cute Face!');
})

app.use('/auth',authRouter);
app.use('/faculty',facultyRouter);
app.use('/hod',hodRouter);
app.use('/admin',adminRouter);

app.listen(process.env.PORT,async ()=>{
    await connectDB();
    console.log(`server started at port ${process.env.PORT}`);
})