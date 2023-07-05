import express, { Router } from 'express';
// const RazorPay=require('razorpay');
// const crypto=require("crypto");
import razorpay  from 'razorpay';
import crypto from 'crypto';
const paymentRouter = express.Router();


//create orders
//api:  /api/payment/createorder/:orderId

paymentRouter.post("/createorder/:orderId", async(req,res)=>{
    try{
        
        const instance= new razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
        });

        const options={          //we got amout to be paid from req body
            amount: req.body.amount*100,                                               //to convert dollar to rupees.......... I think its how razorpay is defined
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex"),
        };
        instance.orders.create(options, (error, order)=>{
            if(error){
                //console.log(error);
                return res.status(500).json({message:"Something went wrong"})
            }else{
                res.status(200).json({data: order});
            }
        })
    }catch(error){
        res.status(500).json({message: "Internal Server Error!"});
    }
});

//api:  /api/payment/verify  to verify payment

paymentRouter.post("/verify", async (req, res) => {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
        const sign=razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign= crypto
            .createHmac("sha256", process.env.KEY_SECRET)
            .update(sign.toString())
            .digest("hex");
        
        if(razorpay_signature === expectedSign){
            return res.status(200).json({message: "Payment verified successfully", verified: true});
        }
        else{
            return res.status(400).json({message: "Invalid signature sent" , verified: false});
        }
    }catch(error){
        res.status(500).json({message: "Internal Server Error!"});
    }
});
export default paymentRouter;