import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import Card from 'react-bootstrap/esm/Card';
import { Helmet } from 'react-helmet-async';
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom';
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store';
import { getError } from '../utils';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/esm/Button';

function reducer(state,action){
    switch(action.type){
        case 'FETCH_REQUEST':
            return {...state, loaing: true, error: ''};
        case 'FETCH_SUCCESS':
            return {...state, loading: false, order: action.payload, error:''};
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload};
        default:
            return state;
    }
}

export default function OrderScreen() {


    const {search}=useLocation();
    //from search object get the parameter redirect  i.e. /shipping here
    const redirectInUrl= new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

  const params=useParams();
  const {id: orderId} = params;     //take id from params and rename it to orderId
  const navigate=useNavigate();
  const {state}=useContext(Store);
  const {userInfo}=state;

  const [{loading, error, order},dispatch]=useReducer(reducer,{
    loading:true,
    order:{},
    error:'',
  });

  useEffect(() => {      //to bring order info from backend
    const fetchOrder = async()=>{
        try{
            dispatch({type: 'FETCH_REQUEST'});
            const {data} =await axios.get(`/api/orders/${orderId}`, {
                headers: {authorization: `Bearer ${userInfo.token}`},
            });
            dispatch({type: 'FETCH_SUCCESS', payload: data});     //after successful api responce dispatch FETCH_SUCCESS
        }catch(err){
            dispatch({type: 'FETCH_FAIL', payload: getError(err)});
        }
    };
    
    if(!userInfo){
        return navigate('/signin');
    }
    if(!order._id || (order._id && order._id !== orderId)){
        fetchOrder();
    }
  }, [userInfo, order, orderId, navigate]);



  ///////////////////////////////////////////////

  const updateOrder = async (details)=>{             //update order after successfull payment
    try{
        const {data}= await axios.put(
            `/api/orders/${orderId}/paid`,                  //api to update the order that it is paid
            details,
            {
                headers : {authorization: `Bearer ${userInfo.token}`},
            }
        );
        if(data.order.isPaid){
            console.log("updated order after payment:");
            console.log(data.order);
            toast.success(data.message);
        }
    }catch(error){
        toast.error(getError(error));
    }
  }



  const initPayment=async (data)=>{
   
    const {data: key_id}=await axios.get(                    //for getting the key_id from backend i.e. environment variable
        '/api/keys/razorpay',
        {
            headers : {authorization: `Bearer ${userInfo.token}`},
        }
    );
    // console.log("init payment called");
    // console.log(key_id);


    const options={
        key:key_id,
        amount:data.amount,
        currency:data.currency,
        name: "Kirana Konnect",
        description: "Test Transaction",
        order_id: data.id,

        //this handler function will be called after successful payment
        handler: async(response)=>{                  //response is the response we get after successful payment
            try{
                console.log("Response after successful payment:");   
                console.log(response);         
                const {data}=await axios.post(
                    '/api/payment/verify',
                    response
                );
                console.log("Response from payment verify api:");   
                console.log(data);     
                if(data.verified===true){             //successful payment verification
                    //toast.success(data.message);
                    const details={
                        email: userInfo.email,
                        status:200,
                        order_id:response.razorpay_order_id,           //or data.id both same
                        payment_id:response.razorpay_payment_id,
                    };
                    updateOrder(details);
                    navigate(redirect);
                }     
            }catch(error){
                console.log(error);
                toast.error(getError(error));
            }
            
        },
        
        theme:{
            color: '#3399cc',
        }
    };
    //create new razorpay instance by passing options
    const rzp1=new window.Razorpay(options);
    //open checkout page     , checkout page is the pop up screen which appears on the screen for entering payment details
    rzp1.open();
   
  }


  const handlePayment=async ()=>{
    try{
        const  {data}=await axios.post(       //we get the razorpay order id from the server i.e. order object created and data returned
            `/api/payment/createorder/${orderId}`,
            {amount: order.totalPrice}, 

        );
        console.log("Response after paymenyt order creation:"); 
        console.log(data);          
        initPayment(data.data);
        
    }catch(error){
        console.log("handlePayment: "+error);
        toast.error(getError(error));
    }
    
  };
  ///////////////////////////////////////////////////



  return loading?(
        <LoadingBox></LoadingBox>
    ):
    error?(
        <MessageBox variant="danger">{error}</MessageBox>
    ):(
        <div>
            <Helmet><title>Order {orderId}</title></Helmet>
            <h1 className='my-3'>Order {orderId}</h1>
            <Row>
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Shipping</Card.Title>
                            <Card.Text>
                                <strong>Name:</strong> {order.shippingAddress.fullName} <br/>
                                <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city},
                                {order.shippingAddress.postalCode},{order.shippingAddress.country}
                            </Card.Text>
                            {order.isDelivered? (
                                <MessageBox variant="success">Delivered At {order.deliveredAt}</MessageBox>
                            ):(
                                <MessageBox variant="danger">Not Delivered</MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method:</strong> {order.paymentMethod} <br/>
                            </Card.Text>
                            {order.isPaid? (
                                <MessageBox variant="success">Paid At {order.paidAt}</MessageBox>
                            ):(
                                <MessageBox variant="danger">Not Paid</MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Items</Card.Title>
                            <ListGroup variant="flush">
                                {order.orderItems.map((item)=>(
                                    <ListGroup.Item key={item._id}>
                                        <Row className="align-items-center">
                                            <Col md={6}>
                                                <img src={item.image} alt={item.name} className='img-fluid rounded img-thumbnail'></img>{' '}
                                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                            </Col>
                                            <Col md={3}><span>{item.quantity}</span></Col>
                                            <Col md={3}><span>{item.price}</span></Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className='mb-3'>
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>₹{order.itemsPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>₹{order.shippingPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col>₹{order.taxPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Order Total</Col>
                                        <Col><strong>₹{order.totalPrice.toFixed(2)}</strong></Col>
                                    </Row>
                                </ListGroup.Item>
                                {!order.isPaid && (
                                    <ListGroup.Item>
                                        {/* {isPending?(<LoadingBox/>):( */}
                                            <div className='my-3'>
                                                <Button variant="warning" onClick={handlePayment}><strong>Buy Now</strong></Button>
                                            </div>
                                        {/* )} */}
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
  
}
