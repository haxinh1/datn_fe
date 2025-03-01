import React from 'react'
import { Image } from "antd";

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import '../assets/css/bootstrap.min.css';
import '../assets/css/plugins/owl-carousel/owl.carousel.css';
import '../assets/css/plugins/magnific-popup/magnific-popup.css';
import '../assets/css/plugins/jquery.countdown.css';
import '../assets/css/style.css';
import '../assets/css/skins/skin-demo-8.css';
import '../assets/css/demos/demo-8.css';
import brand1 from "../assets/images/brands/1.png";
import brand2 from "../assets/images/brands/2.png";
import brand3 from "../assets/images/brands/3.png";
import brand4 from "../assets/images/brands/4.png";
import brand5 from "../assets/images/brands/5.png";
import brand6 from "../assets/images/brands/6.png";
import brand7 from "../assets/images/brands/7.png";
import banner1 from "../assets/images/demos/demo-8/banners/banner-1.jpg";
import banner2 from "../assets/images/demos/demo-8/banners/banner-2.jpg";
import banner3 from "../assets/images/demos/demo-8/banners/banner-3.jpg";
import banner4 from "../assets/images/demos/demo-8/banners/banner-4.jpg";
import banner5 from "../assets/images/demos/demo-8/banners/banner-5.jpg";
import banner6 from "../assets/images/demos/demo-8/banners/banner-6.jpg";


import slider1 from "../assets/images/demos/demo-8/slider/img-1.png";
import slider2 from "../assets/images/demos/demo-8/slider/img-2.png";

import product1 from "../assets/images/demos/demo-8/products/product-1-1.jpg"
import product2 from "../assets/images/demos/demo-8/products/product-1-2.jpg"
import product21 from "../assets/images/demos/demo-8/products/product-2-1.jpg"
import product22 from "../assets/images/demos/demo-8/products/product-2-2.jpg"

import productThumb1 from "../assets/images/demos/demo-8/products/product-1-thumb.jpg"
import productThumb2 from "../assets/images/demos/demo-8/products/product-1-2-thumb.jpg"
import productThumb3 from "../assets/images/demos/demo-8/products/product-1-3-thumb.jpg"

import ProductList from '../components/client/product/ProductList';

const Home = () => {
  return (
    <>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
        <SwiperSlide> <div className="intro-slide" style={{ backgroundImage: "url('assets/images/demos/demo-8/slider/slide-1.jpg')" }}>
          <div className="container intro-content text-left">
            <h3 className="intro-subtitle">Limited time only *</h3>
            <h1 className="intro-title">Summer<br /><strong>sale</strong></h1>
            <h3 className="intro-subtitle">Up to 50% off</h3>

            <a href="category.html" className="btn">
              <span>SHOP NOW</span>
              <i className="icon-long-arrow-right"></i>
            </a>
          </div>
          <img className="position-right" src={slider1} />
        </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="intro-slide" style={{ backgroundImage: "url('assets/images/demos/demo-8/slider/slide-2.jpg')" }}>
            <div className="container intro-content text-right">
              <h3 className="intro-subtitle">PREMIUM QUALITY</h3>
              <h1 className="intro-title">coats <span className="highlight">&</span><br />jackets</h1>

              <a href="category.html" className="btn">
                <span>SHOP NOW</span>
                <i className="icon-long-arrow-right"></i>
              </a>
            </div>
            <img className="position-left" src={slider2} />
          </div>
        </SwiperSlide>

      </Swiper>

      <div className="pt-2 pb-2">
        <div className="container brands">
          <div className="banner-group">
            <div className="row">
              <div className="col-sm-6 col-lg-4">
                <div className="banner banner-overlay">
                  <a href="#">
                    <img src={banner1} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h4 className="banner-subtitle"><a href="#">Final reduction</a></h4>
                    <h3 className="banner-title"><a href="#"><strong>Sandals & <br />Flip Flops</strong> <br />up to 60% off</a></h3>
                    <a href="#" className="btn btn-outline-white banner-link">Shop Now <i className="icon-long-arrow-right"></i></a>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-4">
                <div className="banner banner-overlay">
                  <a href="#">
                    <img src={banner2} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h4 className="banner-subtitle"><a href="#">Limited time only.</a></h4>
                    <h3 className="banner-title"><a href="#"><strong>Trainers & <br />Sportwear</strong> <br />40 -70% off</a></h3>
                    <a href="#" className="btn btn-outline-white banner-link">Shop Now <i className="icon-long-arrow-right"></i></a>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-4 d-none d-lg-block">
                <div className="banner banner-overlay">
                  <a href="#">
                    <img src={banner3} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h4 className="banner-subtitle"><a href="#">This week we love...</a></h4>
                    <h3 className="banner-title"><a href="#"><strong>Women's <br />Accessories </strong> <br />from $6.99</a></h3>
                    <a href="#" className="btn btn-outline-white banner-link">Shop Now <i className="icon-long-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="owl-carousel mt-3 mb-3 owl-simple" data-toggle="owl"
            data-owl-options='{
                            "nav": false, 
                            "dots": false,
                            "margin": 30,
                            "loop": false,
                            "responsive": {
                                "0": {
                                    "items":2
                                },
                                "420": {
                                    "items":3
                                },
                                "600": {
                                    "items":4
                                },
                                "900": {
                                    "items":5
                                },
                                "1024": {
                                    "items":6
                                }
                            }
                        }'>
            <a href="#" className="brand">
              <img src={brand1} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand2} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand3} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand4} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand5} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand6} alt="Brand Name" />
            </a>

            <a href="#" className="brand">
              <img src={brand7} alt="Brand Name" />
            </a>
          </div>
        </div>
      </div>

      <div className="mb-3"></div>


      <div className="container">
        <ul className="nav nav-pills nav-big nav-border-anim justify-content-center mb-2 mb-md-3" role="tablist">
          <li className="nav-item">
            <a className="nav-link active" id="products-featured-link" data-toggle="tab" href="#products-featured-tab" role="tab" aria-controls="products-featured-tab" aria-selected="true">Featured</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="products-sale-link" data-toggle="tab" href="#products-sale-tab" role="tab" aria-controls="products-sale-tab" aria-selected="false">On Sale</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="products-top-link" data-toggle="tab" href="#products-top-tab" role="tab" aria-controls="products-top-tab" aria-selected="false">Top Rated</a>
          </li>
        </ul>
        <div className="tab-content tab-content-carousel">
          <div className="tab-pane p-0 fade show active" id="products-featured-tab" role="tabpanel" aria-labelledby="products-featured-link">
            <div className="owl-carousel owl-simple carousel-equal-height carousel-with-shadow" data-toggle="owl"
              data-owl-options='{
                                "nav": false, 
                                "dots": true,
                                "margin": 20,
                                "loop": false,
                                "responsive": {
                                    "0": {
                                        "items":2
                                    },
                                    "480": {
                                        "items":2
                                    },
                                    "768": {
                                        "items":3
                                    },
                                    "992": {
                                        "items":4
                                    },
                                    "1200": {
                                        "items":4,
                                        "nav": true,
                                        "dots": false
                                    }
                                }
                            }'>
              <div className="product product-2">
                <figure className="product-media">
                  <a href="product.html">
                    <img src={product1} alt="Product image" className="product-image" />
                    <img src={product2} alt="Product image" className="product-image-hover" />
                  </a>

                  <div className="product-action-vertical">
                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable" title="Add to wishlist"><span>add to wishlist</span></a>
                  </div>

                  <div className="product-action ">
                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                  </div>
                </figure>

                <div className="product-body">
                  <div className="product-cat">
                    <a href="#">Clothing</a>
                  </div>
                  <h3 className="product-title"><a href="product.html">Denim jacket</a></h3>
                  <div className="product-price">
                    $19.99
                  </div>
                  <div className="product-nav product-nav-thumbs">
                    <a href="#" className="active">
                      <img src={productThumb1} alt="product desc" />
                    </a>
                    <a href="#">
                      <img src={productThumb2} alt="product desc" />
                    </a>
                    <a href="#">
                      <img src={productThumb3} alt="product desc" />
                    </a>
                  </div>

                </div>
              </div>

              <div className="product product-2">
                <figure className="product-media">
                  <a href="product.html">
                    <img src={product21} alt="Product image" className="product-image" />
                    <img src={product22} alt="Product image" className="product-image-hover" />
                  </a>

                  <div className="product-action-vertical">
                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable" title="Add to wishlist"><span>add to wishlist</span></a>
                  </div>

                  <div className="product-action ">
                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                  </div>
                </figure>

                <div className="product-body">
                  <div className="product-cat">
                    <a href="#">Shoes</a>
                  </div>
                  <h3 className="product-title"><a href="product.html">Sandals</a></h3>
                  <div className="product-price">
                    $24.99
                  </div>
                </div>
              </div>

              <div className="product product-2">
                <figure className="product-media">
                  <span className="product-label label-sale">sale</span>
                  <a href="product.html">
                    <img src="assets/images/demos/demo-8/products/product-3-1.jpg" alt="Product image" className="product-image" />
                    <img src="assets/images/demos/demo-8/products/product-3-2.jpg" alt="Product image" className="product-image-hover" />
                  </a>

                  <div className="product-action-vertical">
                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable" title="Add to wishlist"><span>add to wishlist</span></a>
                  </div>

                  <div className="product-action ">
                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                  </div>
                </figure>

                <div className="product-body">
                  <div className="product-cat">
                    <a href="#">Clothing</a>
                  </div>
                  <h3 className="product-title"><a href="product.html">Printed sweatshirt</a></h3>
                  <div className="product-price">
                    <span className="new-price">Now $7.99</span>
                    <span className="old-price">Was $12.99</span>
                  </div>
                </div>
              </div>

              <div className="product product-2">
                <figure className="product-media">
                  <a href="product.html">
                    <img src="assets/images/demos/demo-8/products/product-4-1.jpg" alt="Product image" className="product-image" />
                    <img src="assets/images/demos/demo-8/products/product-4-2.jpg" alt="Product image" className="product-image-hover" />
                  </a>

                  <div className="product-action-vertical">
                    <a href="#" className="btn-product-icon btn-wishlist btn-expandable" title="Add to wishlist"><span>add to wishlist</span></a>
                  </div>

                  <div className="product-action ">
                    <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                  </div>
                </figure>

                <div className="product-body">
                  <div className="product-cat">
                    <a href="#">Clothing</a>
                  </div>
                  <h3 className="product-title"><a href="product.html">Linen-blend paper bag trousers</a></h3>
                  <div className="product-price">
                    $17.99
                  </div>
                  <div className="product-nav product-nav-thumbs">
                    <a href="#" className="active">
                      <img src="assets/images/demos/demo-8/products/product-4-thumb.jpg" alt="product desc" />
                    </a>
                    <a href="#">
                      <img src="assets/images/demos/demo-8/products/product-4-2-thumb.jpg" alt="product desc" />
                    </a>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 mb-xl-2"></div>

      <div className="trending">
        <a href="#">
          <img src={banner4} alt="Banner" />
        </a>
        <div className="banner banner-big d-md-block">
          <div className="banner-content text-center">
            <h4 className="banner-subtitle text-white">Trending</h4>
            <h3 className="banner-title text-white">New League</h3>
            <p className="d-none d-lg-block text-white">Lorem ipsum dolor sit amet, consectetuer adipiscing elit.<br />Donec odio. Quisque volutpat mattis eros. </p>

            <a href="category.html" className="btn btn-primary-white"><span>Shop Now</span><i className="icon-long-arrow-right"></i></a>
          </div>
        </div>
      </div>


      <div className="container new-arrivals">
        <div className="row">
          <div className="col-md-6">
            <div className="banner banner-overlay">
              <a href="#">
                <img src={banner5} alt="Banner" />
              </a>

              <div className="banner-content">
                <h4 className="banner-subtitle d-none d-lg-block"><a href="#">New Arrivals</a></h4>
                <h3 className="banner-title"><a href="#">Women’s</a></h3>
                <a href="#" className="btn btn-outline-white banner-link">Shop Now <i className="icon-long-arrow-right"></i></a>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="banner banner-overlay">
              <a href="#">
                <img src={banner6} alt="Banner" />
              </a>

              <div className="banner-content">
                <h4 className="banner-subtitle d-none d-lg-block"><a href="#">New Arrivals</a></h4>
                <h3 className="banner-title "><a href="#">Men’s</a></h3>
                <a href="#" className="btn btn-outline-white banner-link">Shop Now <i className="icon-long-arrow-right"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5"></div>

      <div className="container recent-arrivals">
        <div className="heading heading-flex align-items-center mb-3">
          <h2 className="title title-lg">Recent Arrivals</h2>
          <ul className="nav nav-pills nav-border-anim justify-content-center" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="recent-all-link" data-toggle="tab" href="#recent-all-tab" role="tab" aria-controls="recent-all-tab" aria-selected="true">All</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="recent-women-link" data-toggle="tab" href="#recent-women-tab" role="tab" aria-controls="recent-women-tab" aria-selected="false">Women</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="recent-men-link" data-toggle="tab" href="#recent-men-tab" role="tab" aria-controls="recent-men-tab" aria-selected="false">Men</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="recent-shoes-link" data-toggle="tab" href="#recent-shoes-tab" role="tab" aria-controls="recent-shoes-tab" aria-selected="false">Shoes & Boots</a>
            </li>
          </ul>
        </div>

        <div className="tab-content">
          <div className="tab-pane p-0 fade show active" id="recent-all-tab" role="tabpanel" aria-labelledby="recent-all-link">
            <ProductList />
          </div>
          {/* <div className="tab-pane p-0 fade" id="recent-women-tab" role="tabpanel" aria-labelledby="recent-women-link">
            <div className="products">
              <div className="row justify-content-center">
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <span className="product-label label-sale">Sale</span>
                      <a href="product.html">
                        <img src={product51} alt="Product image" className="product-image" />
                        <img src={product52} alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Clothing</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Tie-detail top</a></h3>
                      <div className="product-price">
                        <span className="new-price">Now $3.99</span>
                        <span className="old-price">Was $6.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <a href="product.html">
                        <img src="assets/images/demos/demo-8/products/product-6-1.jpg" alt="Product image" className="product-image" />
                        <img src="assets/images/demos/demo-8/products/product-6-2.jpg" alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Shoes</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Sandals</a></h3>
                      <div className="product-price">
                        $12.99
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane p-0 fade" id="recent-men-tab" role="tabpanel" aria-labelledby="recent-men-link">
            <div className="products">
              <div className="row justify-content-center">
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <a href="product.html">
                        <img src={product111} alt="Product image" className="product-image" />
                        <img src={product112} alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Shoes</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Loafers</a></h3>
                      <div className="product-price">
                        $9.99
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <span className="product-label label-sale">sale</span>
                      <a href="product.html">
                        <img src={product121} alt="Product image" className="product-image" />
                        <img src={product122} alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Clothing</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Super Skinny High Jeggings</a></h3>
                      <div className="product-price">
                        <span className="new-price">Now $12.99</span>
                        <span className="old-price">Was $17.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane p-0 fade" id="recent-shoes-tab" role="tabpanel" aria-labelledby="recent-shoes-link">
            <div className="products">
              <div className="row justify-content-center">
                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <a href="product.html">
                        <img src={product71} alt="Product image" className="product-image" />
                        <img src={product72} alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Bags</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Small bucket bag</a></h3>
                      <div className="product-price">
                        $14.99
                      </div>

                      <div className="product-nav product-nav-thumbs">
                        <a href="#" className="active">
                          <img src={productThumb7} alt="product desc" />
                        </a>
                        <a href="#">
                          <img src={productThumb72} alt="product desc" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <a href="product.html">
                        <img src="assets/images/demos/demo-8/products/product-8-1.jpg" alt="Product image" className="product-image" />
                        <img src="assets/images/demos/demo-8/products/product-8-2.jpg" alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Clothing</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">Denim jacket</a></h3>
                      <div className="product-price">
                        $34.99
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-4 col-lg-3">
                  <div className="product product-2 text-center">
                    <figure className="product-media">
                      <a href="product.html">
                        <img src={product91} alt="Product image" className="product-image" />
                        <img src={product92} alt="Product image" className="product-image-hover" />
                      </a>

                      <div className="product-action-vertical">
                        <a href="#" className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                      </div>

                      <div className="product-action">
                        <a href="#" className="btn-product btn-cart"><span>add to cart</span></a>
                      </div>
                    </figure>

                    <div className="product-body">
                      <div className="product-cat">
                        <a href="#">Clothing</a>
                      </div>
                      <h3 className="product-title"><a href="product.html">BShort wrap dress</a></h3>
                      <div className="product-price">
                        $17.99
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className="more-container text-center mt-3 mb-3">
          <a href="category.html" className="btn btn-outline-dark-3 btn-more"><span>View More</span><i className="icon-long-arrow-right"></i></a>
        </div>
      </div>

      <div className="mb-7"></div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-4 col-sm-6">
            <div className="icon-box icon-box-card text-center">
              <span className="icon-box-icon">
                <i className="icon-rocket"></i>
              </span>
              <div className="icon-box-content">
                <h3 className="icon-box-title">Payment & Delivery</h3>
                <p>Free shipping for orders over $50</p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-sm-6">
            <div className="icon-box icon-box-card text-center">
              <span className="icon-box-icon">
                <i className="icon-rotate-left"></i>
              </span>
              <div className="icon-box-content">
                <h3 className="icon-box-title">Return & Refund</h3>
                <p>Free 100% money back guarantee</p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-sm-6">
            <div className="icon-box icon-box-card text-center">
              <span className="icon-box-icon">
                <i className="icon-life-ring"></i>
              </span>
              <div className="icon-box-content">
                <h3 className="icon-box-title">Quality Support</h3>
                <p>Alway online feedback 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container instagram">
        <div className="heading text-center">
          <h2 className="title title-lg">Follow Us On Instagram</h2>
          <p className="title-desc">Wanna share your style with us?</p>
        </div>
      </div>




    </>
  )
}

export default Home