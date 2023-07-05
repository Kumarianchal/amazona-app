import mongoose from 'mongoose';
//schema for product
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true},
        slug: {type: String, required: true, unique: true},
        image: {type: String, required: true},
        brand: {type: String, required: true},
        category: {type: String, required: true},
        description: {type: String, required: true},
        price: {type: Number, required: true},
        countInStock: {type: String, required: true},
        rating: {type: Number, required: true},
        numReviews: {type: Number, required: true},
    },
    {
        timestamps: true            //to get the parameters ceatedAt and updatedAt
    }
);

//create a model of that schema
const Product = mongoose.model('Product',productSchema);     //name of model is Product and we are using productSchema to create that model
export default Product;   //export the model onject