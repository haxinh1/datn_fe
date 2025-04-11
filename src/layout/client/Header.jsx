import React, { useEffect, useState } from "react";
import { Avatar, Tooltip, message } from "antd";
import { Link } from "react-router-dom";
import { AuthServices } from "./../../services/auth";
import { cartServices } from "./../../services/cart";
import logo from "../../assets/images/demos/demo-8/logo.png";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      if (userId) {
        const cartData = await cartServices.fetchCart();
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
        const cartData = JSON.parse(localStorage.getItem("cart_items")) || [];
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
      setCartItemCount(0);
    }
  };

  useEffect(() => {
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

    updateCartCount();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    const handleStorageChange = (e) => {
      if (e.key === "cart_items" || e.key === "user") {
        updateCartCount();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Xử lý sự kiện kéo qua vùng thả
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Xử lý sự kiện thả sản phẩm vào giỏ hàng
  const handleDrop = async (e) => {
    e.preventDefault();
    try {
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));

      let existingAttributes =
        JSON.parse(localStorage.getItem("cartAttributes")) || [];

      const newAttributes = {
        product_id: dragData.product_id,
        product_variant_id: dragData.product_variant_id,
        quantity: dragData.quantity,
        price: dragData.price,
        attributes: dragData.attributes,
      };

      const existingProductIndex = existingAttributes.findIndex(
        (item) =>
          item.product_id === dragData.product_id &&
          item.product_variant_id === dragData.product_variant_id
      );

      if (existingProductIndex !== -1) {
        existingAttributes[existingProductIndex].quantity += dragData.quantity;
      } else {
        existingAttributes.push(newAttributes);
      }

      localStorage.setItem(
        "cartAttributes",
        JSON.stringify(existingAttributes)
      );

      const user = JSON.parse(localStorage.getItem("user"));
      const itemToAdd = {
        user_id: user?.id || null,
        product_id: dragData.product_id,
        product_variant_id: dragData.product_variant_id,
        quantity: dragData.quantity,
        price: dragData.price,
        attributes: dragData.attributes,
      };

      if (user?.id) {
        await cartServices.addCartItem(dragData.product_id, itemToAdd);
      } else {
        let cartItems = JSON.parse(localStorage.getItem("cart_items")) || [];
        const existingCartItemIndex = cartItems.findIndex(
          (item) =>
            item.product_id === dragData.product_id &&
            item.product_variant_id === dragData.product_variant_id
        );

        if (existingCartItemIndex !== -1) {
          cartItems[existingCartItemIndex].quantity += dragData.quantity;
        } else {
          cartItems.push({
            product_id: dragData.product_id,
            product_variant_id: dragData.product_variant_id,
            quantity: dragData.quantity,
          });
        }
        localStorage.setItem("cart_items", JSON.stringify(cartItems));
      }

      message.success("Sản phẩm đã được thêm vào giỏ hàng!");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng qua kéo thả:", error);
      message.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.");
    }
  };

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
            <div
              className="dropdown cart-dropdown"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
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
            <div class="gtranslate_wrapper"></div>
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
