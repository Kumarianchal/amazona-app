import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();


//Route 1: /api/users/signin        i.e. route to sign in
userRouter.post(
    '/signin',
    expressAsyncHandler(async(req, res) => {            //expressAsyncHandler will help to get the errors in async method
        const user = await User.findOne({email: req.body.email });
        if(user){
            if(bcrypt.compareSync(req.body.password, user.password)){
                res.send({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user),
                });
                return;
            } 
        }
        res.status(401).send({message: 'Invalid email or password'});
    })
);

//Route 1: /api/users/signup        i.e. route to sign up
userRouter.post(
    '/signup',
    expressAsyncHandler(async (req,res)=>{
        const newUser=new User({     //create new user
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password),
        });
        const user=await newUser.save();   //save the new user to database
        res.send({          //return it to frontend
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user),
        });
    
    })

);
export default userRouter;