import express from 'express';
import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();    //create an express router object




//This is the api to save the contents of data.js into mogodb


//Route 1: /api/seed/        i.e. route to insert all data.js data
seedRouter.get('/', async(req, res)=>{
    await Product.remove({});            //first remove all previous records from product model
    const createdProducts = await Product.insertMany(data.products);           //create an array of products from data.js file
    
    await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdProducts , createdUsers});
});
export default seedRouter;