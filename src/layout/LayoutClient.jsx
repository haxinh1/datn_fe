import React from "react";
import { Outlet } from "react-router-dom";
import { Image } from "antd";
// import '../assets/css/bootstrap.min.css';
// import '../assets/css/plugins/owl-carousel/owl.carousel.css';
// import '../assets/css/plugins/magnific-popup/magnific-popup.css';
// import '../assets/css/plugins/jquery.countdown.css';
// import '../assets/css/style.css';
// import '../assets/css/skins/skin-demo-8.css';
// import '../assets/css/demos/demo-8.css';
import logo from '../assets/images/demos/demo-8/logo.png';
import logofooter from '../assets/images/demos/demo-8/logofooter.png';
import product1 from '../assets/images/products/cart/product1.jpg';
import product2 from '../assets/images/products/cart/product2.jpg';
import payments from '../assets/images/payments.png';

const LayoutClient = () => {
    return (
        <div className="page-wrapper">
            <header className="header">
                <div className="header-bottom sticky-header">
                    <div className="container">
                        <div className="header-left">
                            <button className="mobile-menu-toggler">
                                <span className="sr-only">Toggle mobile menu</span>
                                <i className="icon-bars"></i>
                            </button>

                            <a href="index.html" className="logo">
                                <Image src={logo} style={{width: "80px", height:"20px"}}/>
                            </a>
                        </div>
                        <div className="header-center">
                            <nav className="main-nav">
                                <ul className="menu sf-arrows">
                                    <li className="megamenu-container active">
                                        <a href="index.html" className="sf-with-ul">Home</a>
                                    </li>
                                    <li>
                                        <a href="category.html" className="sf-with-ul">Shop</a>
                                    </li>
                                    <li>
                                        <a href="product.html" className="sf-with-ul">Product</a>
                                    </li>
                                    <li>
                                        <a href="#" className="sf-with-ul">Pages</a>
                                    </li>
                                    <li>
                                        <a href="blog.html" className="sf-with-ul">Blog</a>
                                    </li>
                                    <li>
                                        <a href="elements-list.html" className="sf-with-ul">Elements</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <div className="header-right">
                            <div className="header-search">
                                <a href="#" className="search-toggle" role="button">
                                    <i className="icon-search"></i>
                                </a>
                                <form action="#" method="get">
                                    <div className="header-search-wrapper">
                                        <label htmlFor="q" className="sr-only">Search</label>
                                        <input
                                        type="search"
                                        className="form-control"
                                        name="q"
                                        id="q"
                                        placeholder="Search in..."
                                        required
                                        />
                                    </div>
                                </form>
                            </div>

                            <a href="wishlist.html" className="wishlist-link">
                                <i className="icon-heart-o"></i>
                                <span className="wishlist-count">3</span>
                            </a>

                            <div className="dropdown cart-dropdown">
                                <a
                                    href="#"
                                    className="dropdown-toggle"
                                    role="button"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                    data-display="static"
                                >
                                    <i className="icon-shopping-cart"></i>
                                    <span className="cart-count">2</span>
                                    <span className="cart-txt">$164.00</span>
                                </a>

                                <div className="dropdown-menu dropdown-menu-right">
                                    <div className="dropdown-cart-products">
                                        <div className="product">
                                            <div className="product-cart-details">
                                                <h4 className="product-title">
                                                    <a href="product.html">Beige knitted elastic runner shoes</a>
                                                </h4>
                                                <span className="cart-product-info">
                                                    <span className="cart-product-qty">1</span> x $84.00
                                                </span>
                                            </div>
                                            <figure className="product-image-container">
                                                <a href="product.html" className="product-image">
                                                <Image src={product1}/>
                                                </a>
                                            </figure>
                                            <a href="#" className="btn-remove" title="Remove Product">
                                                <i className="icon-close"></i>
                                            </a>
                                        </div>

                                        <div className="product">
                                            <div className="product-cart-details">
                                                <h4 className="product-title">
                                                <a href="product.html">Blue utility pinafore denim dress</a>
                                                </h4>
                                                <span className="cart-product-info">
                                                <span className="cart-product-qty">1</span> x $76.00
                                                </span>
                                            </div>
                                            <figure className="product-image-container">
                                                <a href="product.html" className="product-image">
                                                <Image src={product2}/>
                                                </a>
                                            </figure>
                                            <a href="#" className="btn-remove" title="Remove Product">
                                                <i className="icon-close"></i>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="dropdown-cart-total">
                                        <span>Total</span>
                                        <span className="cart-total-price">$160.00</span>
                                    </div>

                                    <div className="dropdown-cart-action">
                                        <a href="cart.html" className="btn btn-primary">
                                        View Cart
                                        </a>
                                        <a href="checkout.html" className="btn btn-outline-primary-2">
                                        <span>Checkout</span>
                                        <i className="icon-long-arrow-right"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <Outlet />
            </main>

            <footer className="footer footer-2">
                <div className="footer-middle">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-12 col-lg-6">
                                <div className="widget widget-about">
                                    <Image src ={logofooter}/>
                                    
                                    <p>
                                    Praesent dapibus, neque id cursus ucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.
                                    Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.
                                    </p>

                                    <div className="widget-about-info">
                                        <div className="row">
                                            <div className="col-sm-6 col-md-4">
                                                <span className="widget-about-title">Got Question? Call us 24/7</span>
                                                <a href="tel:123456789">+0123 456 789</a>
                                            </div>
                                            <div className="col-sm-6 col-md-8">
                                                <span className="widget-about-title">Payment Method</span>
                                                <figure className="footer-payments">
                                                    <Image src={payments} style={{width: "272px", height:"20px"}}/>
                                                </figure>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-sm-4 col-lg-2">
                                <div className="widget">
                                    <h4 className="widget-title">Information</h4>
                                    <ul className="widget-list">
                                        <li><a href="about.html">About Molla</a></li>
                                        <li><a href="#">How to shop on Molla</a></li>
                                        <li><a href="faq.html">FAQ</a></li>
                                        <li><a href="contact.html">Contact us</a></li>
                                        <li><a href="login.html">Log in</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-sm-4 col-lg-2">
                                <div className="widget">
                                    <h4 className="widget-title">Customer Service</h4>
                                    <ul className="widget-list">
                                        <li><a href="#">Payment Methods</a></li>
                                        <li><a href="#">Money-back guarantee!</a></li>
                                        <li><a href="#">Returns</a></li>
                                        <li><a href="#">Shipping</a></li>
                                        <li><a href="#">Terms and conditions</a></li>
                                        <li><a href="#">Privacy Policy</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="col-sm-4 col-lg-2">
                                <div className="widget">
                                    <h4 className="widget-title">My Account</h4>
                                    <ul className="widget-list">
                                        <li><a href="#">Sign In</a></li>
                                        <li><a href="cart.html">View Cart</a></li>
                                        <li><a href="#">My Wishlist</a></li>
                                        <li><a href="#">Track My Order</a></li>
                                        <li><a href="#">Help</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="container">
                        <p className="footer-copyright">Copyright © 2019 Molla Store. All Rights Reserved.</p>
                        <ul className="footer-menu">
                            <li><a href="#">Terms Of Use</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>

                        <div className="social-icons social-icons-color">
                            <span className="social-label">Social Media</span>
                            <a
                            href="#"
                            className="social-icon social-facebook"
                            title="Facebook"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <i className="icon-facebook-f"></i>
                            </a>
                            <a
                            href="#"
                            className="social-icon social-twitter"
                            title="Twitter"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <i className="icon-twitter"></i>
                            </a>
                            <a
                            href="#"
                            className="social-icon social-instagram"
                            title="Instagram"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <i className="icon-instagram"></i>
                            </a>
                            <a
                            href="#"
                            className="social-icon social-youtube"
                            title="Youtube"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <i className="icon-youtube"></i>
                            </a>
                            <a
                            href="#"
                            className="social-icon social-pinterest"
                            title="Pinterest"
                            target="_blank"
                            rel="noopener noreferrer"
                            >
                                <i className="icon-pinterest"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LayoutClient;
