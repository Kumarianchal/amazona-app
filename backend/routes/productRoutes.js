import express from 'express';
import Product from '../models/productModel.js';

const productRouter = express.Router();

//Route 1: /api/products/        i.e. to get all products
productRouter.get('/', async (req, res) => {
    const products = await Product.find();                 //getting all products from db
    res.send(products);
});


//Route 2: /api/products/slug/:slug        i.e. to get a product
productRouter.get('/slug/:slug', async(req,res) => {
    
    const product=await Product.findOne({slug: req.params.slug});
    if(product){
        res.send(product);
    }
    else{
        res.status(404).send({message: 'Product Not Found'});
    }
});

//Route 2: /api/products/:id        i.e. to get a product by id
productRouter.get('/:id', async(req,res) => {
    
    const product=await Product.findById(req.params.id);
    if(product){
        res.send(product);
    }
    else{
        res.status(404).send({message: 'Product Not Found'});
    }
});

export default productRouter;