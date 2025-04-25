import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import brand1 from "../assets/images/brands/1.png";
import brand2 from "../assets/images/brands/2.png";
import brand3 from "../assets/images/brands/3.png";
import brand4 from "../assets/images/brands/4.png";
import brand5 from "../assets/images/brands/5.png";
import brand6 from "../assets/images/brands/6.png";
import brand7 from "../assets/images/brands/7.png";
import theme1 from "../assets/images/theme/theme1.jpg";
import theme2 from "../assets/images/theme/theme2.jpg";
import theme3 from "../assets/images/theme/theme3.jpg";
import ig1 from "../assets/images/theme/ig1.jpg";
import ig2 from "../assets/images/theme/ig2.jpg";
import ig3 from "../assets/images/theme/ig3.jpg";
import ig4 from "../assets/images/theme/ig4.jpg";
import ig5 from "../assets/images/theme/ig5.jpg";
import ig6 from "../assets/images/theme/ig6.jpg";
import banner4 from "../assets/images/demo-8/banners/banner-1.jpg";
import banner5 from "../assets/images/demo-8/banners/banner-2.jpg";
import banner6 from "../assets/images/demo-8/banners/banner-6.jpg";
import slider1 from "../assets/images/demo-8/slider/img-1.png";
import slider2 from "../assets/images/demo-8/slider/img-2.png";
import ProductList from "../components/client/product/ProductList";

import { Link } from "react-router-dom";

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
        <SwiperSlide>
          {" "}
          <div
            className="intro-slide"
            style={{
              backgroundImage:
                "url('assets/images/demo-8/slider/slide-1.jpg')",
            }}
          >
            <div className="container intro-content text-left">
              <h3 className="intro-subtitle">Limited time only *</h3>
              <h1 className="intro-title">
                Summer
                <br />
                <strong>sale</strong>
              </h1>
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
          <div
            className="intro-slide"
            style={{
              backgroundImage:
                "url('assets/images/demo-8/slider/slide-2.jpg')",
            }}
          >
            <div className="container intro-content text-right">
              <h3 className="intro-subtitle">PREMIUM QUALITY</h3>
              <h1 className="intro-title">
                coats <span className="highlight">&</span>
                <br />
                jackets
              </h1>

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
                    <img src={theme1} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h3 className="banner-title">
                      <Link to={`/detailcate/7`}>
                        <strong>
                          Sweater & <br />
                          Đồ nỉ
                        </strong>{" "}
                      </Link>
                    </h3>

                    <Link to={`/detailcate/7`} className="btn btn-outline-white banner-link">
                      xem ngay <i className="icon-long-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-4">
                <div className="banner banner-overlay">
                  <a href="#">
                    <img src={theme2} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h3 className="banner-title">
                      <Link to={`/detailcate/3`}>
                        <strong>
                          Sơ mi & <br />
                          Áo thun
                        </strong>{" "}
                      </Link>
                    </h3>

                    <Link to={`/detailcate/4`} className="btn btn-outline-white banner-link">
                      xem ngay <i className="icon-long-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-lg-4 d-none d-lg-block">
                <div className="banner banner-overlay">
                  <a href="#">
                    <img src={theme3} alt="Banner" />
                  </a>

                  <div className="banner-content">
                    <h3 className="banner-title">
                      <Link to={`/detailcate/5`}>
                        <strong>
                          bomber & <br />
                          jacket{" "}
                        </strong>{" "}
                      </Link>
                    </h3>

                    <Link to={`/detailcate/5`} className="btn btn-outline-white banner-link">
                      xem ngay <i className="icon-long-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3"></div>

      <div className="container">
        <ul
          className="nav nav-pills nav-big nav-border-anim justify-content-center mb-2 mb-md-3"
          role="tablist"
        >
          <li className="nav-item">
            <a
              className="nav-link active"
              id="products-featured-link"
              data-toggle="tab"
              href="#products-featured-tab"
              role="tab"
              aria-controls="products-featured-tab"
              aria-selected="true"
            >
              Featured
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              id="products-sale-link"
              data-toggle="tab"
              href="#products-sale-tab"
              role="tab"
              aria-controls="products-sale-tab"
              aria-selected="false"
            >
              On Sale
            </a>
          </li>
          <li className="nav-item">
            <a
              className="nav-link"
              id="products-top-link"
              data-toggle="tab"
              href="#products-top-tab"
              role="tab"
              aria-controls="products-top-tab"
              aria-selected="false"
            >
              Top Rated
            </a>
          </li>
        </ul>
      </div>

      <div className="mb-3 mb-xl-2"></div>

      <div className="trending">
        <a href="#">
          <img src={banner4} alt="Banner" style={{ width: '100%' }} />
        </a>
        <div className="banner banner-big d-md-block">
          <div className="banner-content text-center">
            <h4 className="banner-subtitle text-white">Trending</h4>
            <h3 className="banner-title text-white">New League</h3>
            <p className="d-none d-lg-block text-white">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
              <br />
              Donec odio. Quisque volutpat mattis eros.{" "}
            </p>

            <a href="category.html" className="btn btn-primary-white">
              <span>Shop Now</span>
              <i className="icon-long-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="container new-arrivals">
        <div className="row">
          <div className="col-md-6">
            <div className="banner banner-overlay">
              <a href="#">
                <img src={banner5} alt="Banner" style={{ height: '300px' }} />
              </a>

              <div className="banner-content">
                <h4 className="banner-subtitle d-none d-lg-block">
                  <a href="#">New Arrivals</a>
                </h4>
                <h3 className="banner-title">
                  <a href="#">Women’s</a>
                </h3>
                <a href="#" className="btn btn-outline-white banner-link">
                  Shop Now <i className="icon-long-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="banner banner-overlay">
              <a href="#">
                <img src={banner6} alt="Banner" style={{ height: '300px' }} />
              </a>

              <div className="banner-content">
                <h4 className="banner-subtitle d-none d-lg-block">
                  <a href="#">New Arrivals</a>
                </h4>
                <h3 className="banner-title ">
                  <a href="#">Men’s</a>
                </h3>
                <a href="#" className="btn btn-outline-white banner-link">
                  Shop Now <i className="icon-long-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5"></div>

      <hr />

      <div className="container recent-arrivals">
        <div className="heading heading-flex align-items-center mb-3">
          <h2 className="title title-lg">sản phẩm mới ra mắt</h2>
          {/* <ul
            className="nav nav-pills nav-border-anim justify-content-center"
            role="tablist"
          >
            <li className="nav-item">
              <a
                className="nav-link active"
                id="recent-all-link"
                data-toggle="tab"
                href="#recent-all-tab"
                role="tab"
                aria-controls="recent-all-tab"
                aria-selected="true"
              >
                All
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="recent-women-link"
                data-toggle="tab"
                href="#recent-women-tab"
                role="tab"
                aria-controls="recent-women-tab"
                aria-selected="false"
              >
                Women
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="recent-men-link"
                data-toggle="tab"
                href="#recent-men-tab"
                role="tab"
                aria-controls="recent-men-tab"
                aria-selected="false"
              >
                Men
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="recent-shoes-link"
                data-toggle="tab"
                href="#recent-shoes-tab"
                role="tab"
                aria-controls="recent-shoes-tab"
                aria-selected="false"
              >
                Shoes & Boots
              </a>
            </li>
          </ul> */}
        </div>

        <div className="tab-content">
          <div
            className="tab-pane p-0 fade show active"
            id="recent-all-tab"
            role="tabpanel"
            aria-labelledby="recent-all-link"
          >
            <ProductList />
          </div>
        </div>

        <div className="more-container text-center mt-3 mb-3">
          <Link to='/list-prcl'>
            <button className="btn btn-outline-dark-3 btn-more">
              <span>Xem Thêm</span>
              <i className="icon-long-arrow-right"></i>
            </button>
          </Link>
        </div>
      </div>

      <div className="mb-7"></div>

      <hr />

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

      <div className="group1" >
        <div className="instagram-feed">
          <img src={ig1} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>466</a>
            <a href="#"><i className="icon-comments"></i>65</a>
          </div>
        </div>

        <div className="instagram-feed">
          <img src={ig2} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>39</a>
            <a href="#"><i className="icon-comments"></i>78</a>
          </div>
        </div>

        <div className="instagram-feed">
          <img src={ig5} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>691</a>
            <a href="#"><i className="icon-comments"></i>87</a>
          </div>
        </div>

        <div className="instagram-feed">
          <img src={ig4} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>508</a>
            <a href="#"><i className="icon-comments"></i>124</a>
          </div>
        </div>

        <div className="instagram-feed">
          <img src={ig3} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>433</a>
            <a href="#"><i className="icon-comments"></i>27</a>
          </div>
        </div>

        <div className="instagram-feed">
          <img src={ig6} alt="img" />

          <div className="instagram-feed-content">
            <a href="#"><i className="icon-heart-o"></i>122</a>
            <a href="#"><i className="icon-comments"></i>55</a>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default Home;