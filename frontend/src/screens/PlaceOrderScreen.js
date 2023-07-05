import React, { useContext, useReducer } from 'react'
import Col from 'react-bootstrap/esm/Col'
import Row from 'react-bootstrap/esm/Row'
import Card from 'react-bootstrap/esm/Card'
import Button from 'react-bootstrap/esm/Button'
import ListGroup from 'react-bootstrap/esm/ListGroup'
import { Helmet } from 'react-helmet-async'
import CheckoutSteps from '../components/CheckoutSteps'
import { Store } from '../Store'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { getError } from '../utils'
import Axios from 'axios'
import LoadingBox from '../components/LoadingBox'

//reducer is independent of the componet so it is defined outside the main function component
const reducer=(state, action)=>{
    switch(action.type){
        case 'CREATE_REQUEST':
            return {...state, loading: true};
        case 'CREATE SUCCESS':
            return {...state, loading: false};
        case 'CREATE_FAIL':
            return {...state, loading:false};
        default:
            return state;
    }
};
export default function PlaceOrderScreen() {

  const [{loading}, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const {state, dispatch: ctxDispatch} = useContext(Store);

  const {cart, userInfo} = state;

  const navigate=useNavigate();

  const round2=(num) => {      //function to round off to 2 decimal places
    return Math.round(num*100+Number.EPSILON)/100;
  }
  cart.itemsPrice=round2(
    cart.cartItems.reduce((a,c) => a+c.quantity*c.price, 0)
  );
  cart.shippingPrice=cart.itemsPrice>100?round2(0):round2(40);
  cart.taxPrice=round2(0.15*cart.itemsPrice);
  cart.totalPrice=cart.itemsPrice+cart.shippingPrice+cart.taxPrice;

  const placeOrderHandler=async ()=>{
    try{
        dispatch({type: 'CREATE_REQUEST'});
        const { data }= await Axios.post(
            '/api/orders',
            {                                 //data to be sent to backend to create an order
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                shippingPrice:cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice
            },
            {
                headers:{
                    authorization: `Bearer ${userInfo.token}`,
                },
            }
        );
        ctxDispatch({type: 'CART_CLEAR'});   //THIS goes to Store.js
        dispatch({type:'CREATE_SUCCESS'});   //this goes to the reducer that we defined above
        localStorage.removeItem('cartItems');  //clearing the cart after placing the order
        navigate(`/order/${data.order._id}`);
    }catch(err){
        dispatch({type: 'CREATE_FAIL'});
        console.log(err);
        toast.error(getError(err));
    }
  }
  
  useEffect(() => {
    if(!cart.paymentMethod){
        navigate('/payment');
    }
  }, [cart, navigate])
  return (
    <div>
      <Helmet>
        <title>PlaceOrder</title>
      </Helmet>
      <CheckoutSteps  step1 step2 step3 step4></CheckoutSteps>
      <h1>Preview Order</h1>
      <Row>
        <Col md={8}>
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>
                        Shipping
                    </Card.Title>
                    <Card.Text>
                        <strong>Name:</strong> {cart.shippingAddress.fullName}
                        <br/>
                        <strong>Addresss:</strong>
                        {cart.shippingAddress.address},
                        {cart.shippingAddress.city},
                        {cart.shippingAddress.postalCode},
                        {cart.shippingAddress.country}
                    </Card.Text>
                    <Link to="/shipping">Edit</Link>
                    
                </Card.Body>
            </Card>
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>
                        Payment
                    </Card.Title>
                    <Card.Text>
                        <strong>Method:</strong> {cart.paymentMethod}
                    </Card.Text>
                    <Link to="/payment">Edit</Link>
                    
                </Card.Body>
            </Card>
            <Card className='mb-3'>
                <Card.Body>
                    <Card.Title>
                        Items in your cart
                    </Card.Title>
                    <ListGroup variant="flush">
                        {cart.cartItems.map((item) => (     //to convert each item to a listgroup item 
                            <ListGroup.Item key={item._id}>
                                <Row className='align-items-center'>
                                    <Col md={6}>
                                        <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail' />
                                        {' '}
                                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                    </Col>
                                    <Col md={3}>Quantity: {item.quantity}</Col>
                                    <Col md={3}>Price: ₹{item.price}</Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Link to="/cart">Edit</Link>
                    
                </Card.Body>
            </Card>
        </Col>
        <Col md={4}>
            <Card>
                <Card.Body>
                    <Card.Title>
                        Order Summary
                    </Card.Title>
                    <ListGroup variant="flush">
                        
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>₹{cart.itemsPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>₹{cart.shippingPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>₹{cart.taxPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col><strong>Order Total</strong></Col>
                                    <Col>₹{cart.totalPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-grid">
                                    <Button type='button' onClick={placeOrderHandler} disabled={cart.cartItems.length===0}>
                                        Place Order
                                    </Button>
                                </div>
                                {loading && <LoadingBox/>}
                            </ListGroup.Item>
                    </ListGroup>
                </Card.Body>
            </Card>
        </Col>
      </Row>
    </div>
  )
}
