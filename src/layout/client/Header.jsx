import React, { useEffect, useState } from "react";
import { Avatar, Tooltip } from "antd";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../../assets/css/plugins/jquery.countdown.css";
import "../../assets/css/style.css";
import "../../assets/css/skins/skin-demo-8.css";
import "../../assets/css/demos/demo-8.css";
import logo from "../../assets/images/demos/demo-8/logo.png";
import product1 from "../../assets/images/products/cart/product1.jpg";
import product2 from "../../assets/images/products/cart/product2.jpg";
import { Link } from "react-router-dom";

const Header = () => {

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const storedUserData = JSON.parse(localStorage.getItem("user"));
    setUserData(storedUserData); // Lưu dữ liệu người dùng vào state
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-bottom sticky-header">
          <div className="container">
            <div className="header-left">
              <button className="mobile-menu-toggler">
                <span className="sr-only">Toggle mobile menu</span>
                <i className="icon-bars"></i>
              </button>

              <a href="#" className="logo">
                <Link to="/">
                  <img src={logo} style={{ width: "80px", height: "20px" }} />
                </Link>
                ,
              </a>
            </div>
            <div className="header-center">
              <nav className="main-nav">
                <ul className="menu sf-arrows">
                  <li className="megamenu-container active">
                    <Link to="/" href="" className="sf-with-ul">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="list-prcl" href="" className="sf-with-ul">
                      Shop
                    </Link>
                  </li>
                  <li>
                    <a href="product.html" className="sf-with-ul">
                      Product
                    </a>
                  </li>
                  <li>
                    <a href="#" className="sf-with-ul">
                      Pages
                    </a>
                  </li>
                  <li>
                    <a href="blog.html" className="sf-with-ul">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="elements-list.html" className="sf-with-ul">
                      Elements
                    </a>
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
                    <label htmlFor="q" className="sr-only">
                      Search
                    </label>
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

              <div className="dropdown cart-dropdown">
                <Tooltip title="Giỏ hàng">
                  <Link
                    to={"/cart"}
                    className="dropdown-toggle"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    data-display="static"
                  >
                    <i className="icon-shopping-cart"></i>
                  </Link>
                </Tooltip>

                {/* <div className="dropdown-menu dropdown-menu-right">
                  <div className="dropdown-cart-products">
                    <div className="product">
                      <div className="product-cart-details">
                        <h4 className="product-title">
                          <a href="product.html">
                            Beige knitted elastic runner shoes
                          </a>
                        </h4>
                        <span className="cart-product-info">
                          <span className="cart-product-qty">1</span> x $84.00
                        </span>
                      </div>
                      <figure className="product-image-container">
                        <a href="product.html" className="product-image">
                          <Image src={product1} />
                        </a>
                      </figure>
                      <a href="#" className="btn-remove" title="Remove Product">
                        <i className="icon-close"></i>
                      </a>
                    </div>

                    <div className="product">
                      <div className="product-cart-details">
                        <h4 className="product-title">
                          <a href="product.html">
                            Blue utility pinafore denim dress
                          </a>
                        </h4>
                        <span className="cart-product-info">
                          <span className="cart-product-qty">1</span> x $76.00
                        </span>
                      </div>
                      <figure className="product-image-container">
                        <a href="product.html" className="product-image">
                          <Image src={product2} />
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
                    <Link to={"/cart"} className="btn btn-primary">
                      Giỏ hàng
                    </Link>
                    <Link
                      to={"/checkout"}
                      className="btn btn-outline-primary-2"
                    >
                      Checkout<i className="icon-long-arrow-right"></i>
                    </Link>
                  </div>
                </div> */}
              </div>

              <Tooltip title="Tài khoản">
                <Link to={"/dashboard"} className="wishlist-link">
                  {userData && userData.avatar ? (
                    <Avatar size={36} src={userData.avatar} />
                  ) : (
                    <i className="icon-user"></i>
                  )}
                </Link>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
