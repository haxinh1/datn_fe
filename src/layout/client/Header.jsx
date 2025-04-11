import React, { useEffect, useState } from "react";
import { Avatar, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { AuthServices } from "./../../services/auth";
import { cartServices } from "./../../services/cart";
import logo from "../../assets/images/demos/demo-8/logo.png";

const Header = () => {
  const [userData, setUserData] = useState(null); // Lưu thông tin người dùng
  const [cartItemCount, setCartItemCount] = useState(0); // Lưu số lượng sản phẩm độc đáo trong giỏ hàng

  // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      if (userId) {
        // Người dùng đã đăng nhập: lấy giỏ hàng từ cơ sở dữ liệu
        const cartData = await cartServices.fetchCart();
        // Đếm số sản phẩm độc đáo dựa trên product_id và product_variant_id
        const uniqueProducts = cartData.reduce((acc, item) => {
          const key = `${item.product_id}-${
            item.product_variant_id || "default"
          }`;
          if (!acc[key]) {
            acc[key] = true;
          }
          return acc;
        }, {});
        setCartItemCount(Object.keys(uniqueProducts).length);
      } else {
        // Người dùng chưa đăng nhập: lấy giỏ hàng từ localStorage
        const cartData = JSON.parse(localStorage.getItem("cart_items")) || [];
        // Đếm số sản phẩm độc đáo dựa trên product_id và product_variant_id
        const uniqueProducts = cartData.reduce((acc, item) => {
          const key = `${item.product_id}-${
            item.product_variant_id || "default"
          }`;
          if (!acc[key]) {
            acc[key] = true;
          }
          return acc;
        }, {});
        setCartItemCount(Object.keys(uniqueProducts).length);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy số lượng giỏ hàng:", error);
      setCartItemCount(0); // Đặt về 0 nếu có lỗi để tránh hiển thị sai
    }
  };

  useEffect(() => {
    // Lấy thông tin người dùng nếu đã đăng nhập
    const storedUserId = JSON.parse(localStorage.getItem("user"))?.id;

    if (storedUserId) {
      const fetchUserInfo = async () => {
        try {
          const userInfo = await AuthServices.getAUser(storedUserId);
          setUserData(userInfo);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
      };
      fetchUserInfo();
    }

    // Cập nhật số lượng giỏ hàng ban đầu
    updateCartCount();
  }, []);

  // Lắng nghe sự kiện thay đổi giỏ hàng
  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount();
    };

    // Lắng nghe sự kiện tùy chỉnh 'cart-updated' cho các thay đổi trong cùng tab
    window.addEventListener("cart-updated", handleCartUpdate);

    // Lắng nghe sự kiện storage cho các thay đổi từ tab/cửa sổ khác
    const handleStorageChange = (e) => {
      if (e.key === "cart_items" || e.key === "user") {
        updateCartCount();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Dọn dẹp sự kiện khi component bị hủy
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-bottom sticky-header">
        <div className="container">
          <div className="header-left">
            <button className="mobile-menu-toggler">
              <span className="sr-only">Chuyển đổi menu di động</span>
              <i className="icon-bars"></i>
            </button>

            <a href="#" className="logo">
              <Link to="/">
                <img
                  src={logo}
                  style={{ width: "80px", height: "20px" }}
                  alt="Logo"
                />
              </Link>
            </a>
          </div>
          <div className="header-center">
            <nav className="main-nav">
              <ul className="menu">
                <li className="megamenu-container">
                  <Link to="/" className="sf-with-ul">
                    <span>Trang Chủ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/list-prcl" className="sf-with-ul">
                    <span>Sản Phẩm</span>
                  </Link>
                </li>
                <li>
                  <Link to="/cate" className="sf-with-ul">
                    <span>Danh mục</span>
                  </Link>
                </li>
                <li>
                  <Link to="/list-prcl" className="sf-with-ul">
                    <span>Giới thiệu</span>
                  </Link>
                </li>
                <li>
                  <Link to="/list-prcl" className="sf-with-ul">
                    <span>Chính Sách</span>
                  </Link>
                </li>
                <li>
                  <Link to="/list-prcl" className="sf-with-ul">
                    <span>Liên Hệ</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="header-right">
            <div className="dropdown cart-dropdown">
              <Tooltip title="Giỏ hàng">
                <Link
                  to="/cart"
                  className="dropdown-toggle"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  data-display="static"
                >
                  <i className="icon-shopping-cart"></i>
                  {cartItemCount > 0 && (
                    <span
                      className="cart-item-count"
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-10px",
                        backgroundColor: "#eea287",
                        color: "black",
                        fontSize: "13px",
                        padding: "2px 8px",
                        borderRadius: "50%",
                      }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </div>

            <Tooltip title="Tài khoản">
              <Link
                to={userData ? `/dashboard/orders/${userData.id}` : "/login"}
                className="wishlist-link"
              >
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
  );
};

export default Header;
