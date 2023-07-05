
import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { Store } from '../Store';

export default function Product(props) {
    const { product }=props;
    const {state, dispatch: ctxDispatch} = useContext(Store);
    const {
        cart: {cartItems},
    } = state;

    const addToCartHandler=async(item) =>{
        const existItem = cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity+1 : 1;
        const {data}= await axios.get(`/api/products/${item._id}`);
        if(data.countInStock < quantity){
            window.alert('Sorry! Product is out of Stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: {...item, quantity},
        });
    };
    return (
        <Card>
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} className="card-img-top" alt={product.name}></img>
            </Link>
            <Card.Body>
                <Link to={`/product/${product.slug}`}>
                    <Card.Title>{product.name}</Card.Title>
                </Link>
                
                <Rating 
                    rating={product.rating}
                    numReviews={product.numReviews}
                ></Rating>
                
                <Card.Text>₹{product.price}</Card.Text>

                
                {product.countInStock === 0 ?
                <Button variant="light" disabled>Out of Stock</Button> : 
                <Button onClick={()=> addToCartHandler(product)}>Add to Cart</Button>
                }
                
            </Card.Body>
        </Card>
    )
}