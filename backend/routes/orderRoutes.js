import express from 'express';
import Order from '../models/orderModel.js';
import {isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const orderRouter = express.Router();
//when we send post request to /api/orders/ , this function responds
//isAuth is a middleware that will fill the user field 
orderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler(async(req,res)=>{
    const newOrder=new Order({
        orderItems: req.body.orderItems.map((x)=>({...x, product: x._id})),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,

     });
     const order= await newOrder.save();  
     res.status(201).send({message: 'New Order Created', order}); 
    })
);


//   /api/orders/:id
orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async(req,res)=>{
        const order=await Order.findById(req.params.id);   //searching for an order with a given id
        if(order){     //order exists
            res.send(order);
        }else{
            res.status(404).send({message: 'Order Not Found'});
        }
    })
);


//  api:  /api/orders/:id/paid          //api to update the order that it is paid
orderRouter.put(
    '/:id/paid',
    isAuth,
    expressAsyncHandler(async(req,res)=>{
        const order= await Order.findById(req.params.id);
        if(order){
            order.isPaid=true;
            order.paidAt=Date.now();
            order.paymentResult={
                order_id:req.body.order_id,
                payment_id:req.body.payment_id,
                status: req.body.status,
                update_time:Date.now(),
                email_address:req.body.email,
            };
            const updatedOrder=await order.save();           //saving the updated order into database
            res.send({message: 'Order Paid', order: updatedOrder});
        }else{
            res.status(404).send({message: 'Order Not Found'});
        }
    })
)
export default orderRouter;