import React, { useEffect, useState } from "react";
import { Avatar, Dropdown, Menu, Modal, Tooltip, message, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthServices } from "./../../services/auth";
import { cartServices } from "./../../services/cart";
import logo from "../../assets/images/demo-8/logo.png";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Pusher from "pusher-js";
import AIChat from "./AIChat.jsx";
import ChatIcon from './../../components/client/chat/ChatIcon';
import ChatWindow from './../../components/client/chat/ChatWindow';

let pusherInstance = null;

const initializePusher = (token) => {
  if (!pusherInstance) {
    pusherInstance = new Pusher('6b2509032695e872d989', {
      cluster: 'ap1',
      encrypted: true,
      authEndpoint: '/api/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      },
    });
    console.log('Pusher initialized');
  }
  return pusherInstance;
};

const updatePusherAuth = (token) => {
  if (pusherInstance) {
    pusherInstance.config.auth.headers.Authorization = `Bearer ${token || ''}`;
  }
};

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [chatVisible, setChatVisible] = useState(false);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateCartCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user ? user.id : null;

      if (userId) {
        const cartData = await cartServices.fetchCart();
        const uniqueProducts = cartData.reduce((acc, item) => {
          const key = `${item.product_id}-${item.product_variant_id || "default"}`;
          if (!acc[key]) {
            acc[key] = true;
          }
          return acc;
        }, {});
        setCartItemCount(Object.keys(uniqueProducts).length);
      } else {
        const cartData = JSON.parse(localStorage.getItem("cart_items")) || [];
        const uniqueProducts = cartData.reduce((acc, item) => {
          const key = `${item.product_id}-${item.product_variant_id || "default"}`;
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

  // Hàm lấy thông tin người dùng
  const fetchUserInfo = async (userId) => {
    try {
      const userInfo = await AuthServices.getAUser(userId);
      setUserData(userInfo);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      setUserData(null);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("client_token");

    if (storedUser && storedToken) {
      fetchUserInfo(storedUser.id);
      initializePusher(storedToken);
      setIsLoggedIn(true);
    } else {
      setUserData(null);
    }

    updateCartCount();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      updateCartCount();
    };

    const handleUserLogout = () => {
      setUserData(null);
      updateCartCount();
    };

    const handleUserLogin = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const storedToken = localStorage.getItem("client_token");
      if (storedUser && storedToken) {
        fetchUserInfo(storedUser.id);
        updatePusherAuth(storedToken);
      }
      updateCartCount();
    };

    const handleUserUpdated = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        fetchUserInfo(storedUser.id);
      }
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("user-logout", handleUserLogout);
    window.addEventListener("user-login", handleUserLogin);
    window.addEventListener("user-updated", handleUserUpdated);

    const handleStorageChange = (e) => {
      if (e.key === "cart_items" || e.key === "user" || e.key === "client_token") {
        updateCartCount();
        if (e.key === "user" || e.key === "client_token") {
          const storedUser = JSON.parse(localStorage.getItem("user"));
          const storedToken = localStorage.getItem("client_token");
          if (storedUser && storedToken) {
            fetchUserInfo(storedUser.id);
            updatePusherAuth(storedToken);
          } else {
            setUserData(null);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("user-logout", handleUserLogout);
      window.removeEventListener("user-login", handleUserLogin);
      window.removeEventListener("user-updated", handleUserUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Kiểm tra trạng thái tài khoản qua API (fallback)
  useEffect(() => {
    const checkUserStatus = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.id) {
        try {
          console.log('Checking user status via API');
          const userInfo = await AuthServices.getAUser(storedUser.id);
          if (userInfo.status === "inactive" || userInfo.status === "banned") {
            handleLogout(true);
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái người dùng:", error);
        }
      }
    };

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Lắng nghe sự kiện Pusher
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.id) {
      const pusher = initializePusher(localStorage.getItem("client_token"));
      console.log('Subscribing to channel:', `user.${storedUser.id}`);
      const channel = pusher.subscribe(`user.${storedUser.id}`);

      channel.bind('user-status-updated', (data) => {
        console.log('Received Pusher event:', data);
        if (data.status === 'inactive' || data.status === 'banned') {
          Modal.warning({
            title: 'Tài khoản bị khóa',
            content: 'Tài khoản của bạn đã bị khóa. Bạn sẽ được đăng xuất.',
            onOk: () => handleLogout(true),
            okText: 'Đăng xuất',
            okButtonProps: { autoFocus: true },
            maskClosable: false,
          });
        }
      });

      return () => {
        console.log('Unsubscribing from channel:', `user.${storedUser.id}`);
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [userData]);

  // Hàm xử lý đăng xuất
  const handleLogout = async (isBanned = false) => {
    setLoading(true);
    try {
      console.log("Starting logout");
      const response = await AuthServices.logoutclient();
      console.log("Logout response:", response.message);
  
      // Clear authentication data from localStorage
      localStorage.removeItem("client_token");
      localStorage.removeItem("client");
      localStorage.removeItem("user");
      localStorage.removeItem("cart_items");
  
      // Dispatch logout event
      window.dispatchEvent(new Event("user-logout"));
  
      // Navigate to the home page
      navigate("/");
  
      // Reload the page to ensure the UI reflects the logout state
      window.location.reload();
  
      if (isBanned) {
        notification.warning({
          message: "Tài khoản của bạn đã bị khóa, vui lòng thử lại sau!",
        });
      }
    } catch (error) {
      console.error("Logout failed", error);
  
      // Clear authentication data from localStorage even if logout API fails
      localStorage.removeItem("client_token");
      localStorage.removeItem("client");
      localStorage.removeItem("user");
      localStorage.removeItem("cart_items");
  
      // Dispatch logout event
      window.dispatchEvent(new Event("user-logout"));
  
      // Navigate to the home page
      navigate("/");
  
      // Reload the page to ensure the UI reflects the logout state
      window.location.reload();
  
      if (isBanned) {
        message.warning("Tài khoản của bạn đã bị khóa");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị modal xác nhận đăng xuất
  const showConfirm = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn đăng xuất?",
      content: "Bạn sẽ phải đăng nhập lại để tiếp tục.",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: () => handleLogout(false),
    });
  };

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
                        top: "-4px", // Điều chỉnh vị trí lên trên một chút để cân đối
                        right: "-6px", // Điều chỉnh vị trí sang trái để căn chỉnh tốt hơn
                        backgroundColor: "black",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold", // Tăng độ đậm cho chữ
                        lineHeight: "18px", // Đảm bảo chữ nằm giữa hình tròn
                        width: "18px", // Chiều rộng cố định để tạo hình tròn
                        height: "18px", // Chiều cao bằng chiều rộng để tạo hình tròn
                        display: "flex", // Sử dụng flex để căn giữa nội dung
                        alignItems: "center", // Căn giữa theo chiều dọc
                        justifyContent: "center", // Căn giữa theo chiều ngang
                        borderRadius: "50%", // Tạo hình tròn
                        padding: 0, // Loại bỏ padding để kích thước chính xác
                      }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </div>
            <div className="gtranslate_wrapper"></div>

            {userData ? (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="account">
                      <Link to={`/dashboard/info/${userData.id}`}>
                        <span>
                          <UserOutlined style={{ marginRight: "8px" }} />
                          Tài khoản
                        </span>
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="logout">
                      <span onClick={showConfirm}>
                        <LogoutOutlined style={{ marginRight: "8px" }} />
                        Đăng xuất
                      </span>
                    </Menu.Item>
                  </Menu>
                }
                placement="bottomRight"
                trigger={["click"]}
              >
                <span style={{ cursor: "pointer" }}>
                  {userData.avatar ? (
                    <Avatar size={36} src={userData.avatar} className="wishlist-link" />
                  ) : (
                    <i className="icon-user"></i>
                  )}
                </span>
              </Dropdown>
            ) : (
              <Tooltip title="Tài khoản">
                <Link to="/logincl" className="wishlist-link">
                  <i className="icon-user"></i>
                </Link>
              </Tooltip>
            )}
            
            <AIChat/>
          </div>
          <AIChat />
          <ChatIcon onClick={() => setChatVisible(true)} />
          <ChatWindow
            visible={chatVisible}
            onClose={() => setChatVisible(false)}
            isLoggedIn={!!userData}
            user={userData ? userData.fullname : ""}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;