import React, { useContext } from 'react';

import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar'; 
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import {LinkContainer} from 'react-router-bootstrap';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';


//Some notes

// if we sign in using sign in button on navbar it directs to home page. here redirect is not set i.e. to="/signin"
// if we sign in using proceed to cart button then it goes to to="/signin?redirect=/shipping"  . here redirect is set to /shipping


function App() {
  const {state, dispatch: ctxDispatch} = useContext(Store);
  const {cart, userInfo} = state;
  
  const signoutHandler=()=>{
    ctxDispatch({'type':'USER_SIGNOUT'});
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
  }
  return (
    <BrowserRouter>
        <div className='d-flex flex-column site-container'> 
            <ToastContainer position="bottom-center" limit={1}></ToastContainer>
            <header>
                <Navbar bg="dark" variant="dark">
                    <Container>
                        <LinkContainer to="/">
                            <Navbar.Brand>amazona</Navbar.Brand>
                        </LinkContainer>
                        <Nav className="me-auto">
                            <Link to="/cart" className="nav-link">
                                Cart
                                {
                                    cart.cartItems.length>0 && (
                                        <Badge pill bg="danger">
                                            {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                                        </Badge>
                                    )
                                }
                            </Link>
                            

                            {/* if user is signed in then show the name of the user, else show sign in button */}
                            {userInfo ? (
                                <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                                    <LinkContainer to="/profile">
                                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/orderhistory">
                                        <NavDropdown.Item>Order History</NavDropdown.Item>
                                    </LinkContainer>

                                    <NavDropdown.Divider/>      {/*for a horizontal line */}

                                    <Link className='dropdown-item' to='#signout' onClick={signoutHandler} >Sign Out</Link>
                                    
                                </NavDropdown>
                            ):(
                                <Link className="nav-link" to="/signin">Sign In</Link>
                            )}
                        </Nav>
                    </Container>
                </Navbar>
            </header>
            <main>
                <Container className="mt-3">
                    <Routes>
                        <Route path="/product/:slug" element={<ProductScreen />} />
                        <Route path="/cart" element={<CartScreen />} />
                        <Route path="/signin" element={<SigninScreen />} />
                        <Route path="/shipping" element={<ShippingAddressScreen/>}/>
                        <Route path="signup" element={<SignupScreen/>}/>
                        <Route path="/payment" element={<PaymentMethodScreen/>}/>
                        <Route path="/placeorder" element={<PlaceOrderScreen/>}/>
                        <Route path="/order/:id" element={<OrderScreen/>}/>

                        <Route path="/" element={<HomeScreen />} />
                    </Routes>
                </Container>
                
            </main>
            <footer>
                <div className="text-center">
                    All rights reserved.
                </div>
            </footer>
        </div>
    </BrowserRouter>
  );
}

export default App;
