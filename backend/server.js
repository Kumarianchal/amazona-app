import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';


//to be able to use environment variables use this command
dotenv.config();

//connecting to mongo db
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to db");
})
.catch((err)=>{
    console.log(err.message);
});


const app=express();

//to convert the form data in the post request to json object inside req.body
app.use(express.json());
app.use(cors());                //middleware
app.use(express.urlencoded({extended: true}));


app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders',orderRouter);


//razorpay
//api to return  paytm key id to the front end
app.get('/api/keys/razorpay', (req,res)=>{
    res.send(process.env.KEY_ID || 'sb');    //sb stands for sand box  i.e. test mode  
});
app.use('/api/payment', paymentRouter);
//razorpay

//error handler for express i.e. when there is an error in express-async handler then send the error message
app.use((err, req, res, next) => {
    res.status(500).send({message: err.message});
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log (`serve at http://localhost:${port}`);
})