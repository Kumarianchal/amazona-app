import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Store } from '../Store';
import { useEffect } from 'react';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
    const navigate=useNavigate();
    const {state, dispatch: ctxDispatch} = useContext(Store);
    
    //get shipping address from cart in state so, that the values we engered in shipping address form remains intact on moving from one page to another
    const{
        userInfo,
        cart: {shippingAddress}
    } = state;

    //read the intial state values from state
    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');

    useEffect(() => {
       if(!userInfo){                     
          //navigate('/signin');          //if the person is logged out then redirect to signin screen if the person tries to go to shipping page 
          navigate('/signin?redirect=/shipping');         //and then if the person signs in then redirect to shipping page
       }
    }, [userInfo, navigate]);

    const submitHandler=(e)=>{
        e.preventDefault();
        ctxDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                city,
                postalCode,
                country
            }
        });
        localStorage.setItem(    //save the shipping address in local storage
            'shippingAddress',
            JSON.stringify({
                fullName,
                address,
                city,
                postalCode,
                country
            })
        );
        navigate('/payment');    //navigate to payment page
    }
    return <div>
        <Helmet>
            <title>Shipping address</title>
        </Helmet>

        <CheckoutSteps step1 step2></CheckoutSteps>

        <div className="container small-container">
            <h1 className='my-3'>Shipping Address</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="fullName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control value={address} onChange={(e) => setAddress(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control value={city} onChange={(e) => setCity(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="postalCode">
                    <Form.Label>PostalCode</Form.Label>
                    <Form.Control value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Control value={country} onChange={(e) => setCountry(e.target.value)} required />
                </Form.Group>
                <div className='mb-3'>
                    <Button variant="primary" type="submit">
                        Continue
                    </Button>
                </div>
            </Form>
        </div>
        
    </div>;
}
 