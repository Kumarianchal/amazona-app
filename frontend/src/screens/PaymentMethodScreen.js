import React, { useContext, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Form from 'react-bootstrap/esm/Form'
import Button from 'react-bootstrap/Button'
import CheckoutSteps from '../components/CheckoutSteps'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from "../Store";

export default function PaymentMethodScreen() {
    const navigate=useNavigate();
    const {state, dispatch: ctxDispatch} = useContext(Store);
    const{
        cart:{shippingAddress, paymentMethod},
    }=state;

    const [paymentMethodName, setPaymentMethodName] = useState(paymentMethod || 'RazorPay');

    useEffect(() => {
        if(!shippingAddress.address){
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);


    const submitHandler=(e)=>{
        e.preventDefault();
        ctxDispatch({
            type: 'SAVE_PAYMENT_METHOD' , payload: paymentMethodName
        });
        localStorage.setItem('paymentMethod', paymentMethodName);
        navigate('/placeorder');
    }
  return (
    <div>
      <Helmet>
        <title>Payment Method</title>
      </Helmet>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <h1>Payment Method</h1>
        <Form onSubmit={submitHandler}>
            <div className="mb-3">
                <Form.Check
                    type="radio"
                    id="RazorPay"
                    label="RazorPay"
                    value="RazorPay"
                    checked={paymentMethodName === 'RazorPay'}    //if paymentMethodName is equal to RazorPay then check it
                    onChange={(e)=>setPaymentMethodName(e.target.value)}
                />
            </div>

            {/* Ignore stripe for now */}
            
            {/* <div className="mb-3">
                <Form.Check
                    type="radio"
                    id="Stripe"
                    label="Stripe"
                    value="Stripe"
                    checked={paymentMethodName === 'Stripe'}
                    onChange={(e)=>setPaymentMethodName(e.target.value)}
                />
            </div> */}
            <div className="mb-3">
                <Button type="submit"> Continue</Button>
            </div>
        </Form>
      </div>
    </div>
  )
}
