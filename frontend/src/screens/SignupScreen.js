import Container from "react-bootstrap/esm/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Axios from 'axios';
import { useContext, useState } from "react";
import { Store } from "../Store";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getError } from "../utils";

export default function SignupScreen(){

    const navigate=useNavigate();

    //To get redirect value from url
    //get search object from useLocation
    const {search}=useLocation();
    //from search object get the parameter redirect  i.e. /shipping here
    const redirectInUrl= new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');             //email and password are states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {state, dispatch: ctxDispatch} = useContext(Store);
    const {userInfo}=state;

    //click handler for sign in button
    const submitHandler = async(e) => {
        e.preventDefault();       //to prevent refreshing this page when user clicks on sign in button
        if(password!==confirmPassword){
            toast.error('Passwords do nt match');
            return;
        }
        try{
            const {data} = await Axios.post('/api/users/signup', {          //a post request is sent to this api and the response is stored in data 
                name,
                email,                                                      //we are sending email and password as a post request
                                                                            //this data needs to be stored in context Store we created earlier
                password,
            });
            //after successful signin
            //when we dispatch an action we need to set type of action and payload
            ctxDispatch({type:'USER_SIGNIN', payload:data});
            localStorage.setItem('userInfo', JSON.stringify(data));  //save in local storage
            navigate(redirect || '/');

            //console.log(data);
        }catch(err){
            toast.error(getError(err));
            //alert('Invalid email or password');
        }
    }
    
    // if user is already signed in and tries to go to sign in page then redirect to home
    useEffect(() => {
        
        if(userInfo){          
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);


    return(
        <Container className="small-container">
            <Helmet>
                <title>Sign Up</title>
            </Helmet>
            <h1 className="my-3">Sign Up</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="name" required onChange={(e) => setName(e.target.value)}></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)}></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)}></Form.Control>
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control type="password" required onChange={(e) => setConfirmPassword(e.target.value)}></Form.Control>
                </Form.Group>
                <div className="mb-3">
                    <Button type="submit">Sign Up</Button>
                </div>
                <div className="mb-3">
                    Already have an account?{' '}
                     <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>  {/*if user is new we redirect user to sign up page and set redirect , here redirect value is shipping */}
                </div>
            </Form>
        </Container>
    )
    
}