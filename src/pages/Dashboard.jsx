import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthServices } from "./../services/auth";
import { Modal } from "antd";
import {
  BookOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  MessageOutlined,
  RollbackOutlined,
  UserOutlined,
} from "@ant-design/icons";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const storedClient = JSON.parse(localStorage.getItem("client"));
    setClient(storedClient); // Lấy thông tin người dùng từ localStorage
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");
    const encodedUser = query.get("user");

    if (token && encodedUser) {
      try {
        // Giải mã user
        const user = JSON.parse(decodeURIComponent(encodedUser));

        // Lưu vào localStorage
        localStorage.setItem("client_token", token);
        localStorage.setItem("client", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
        setClient(user);

        // Xóa query khỏi URL để sạch sẽ
        window.history.replaceState(null, "", window.location.pathname);
      } catch (err) {
        console.error("Lỗi khi parse user từ query:", err);
      }
    } else {
      // Nếu không có token/user trong URL, lấy từ localStorage
      const storedClient = JSON.parse(localStorage.getItem("client"));
      if (storedClient) {
        setClient(storedClient);
      }
    }
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await AuthServices.logoutclient();
      console.log(response.message);

      // Xóa dữ liệu client_token và user khỏi localStorage
      localStorage.removeItem("client_token"); // Xóa client_token
      localStorage.removeItem("client"); // Xóa thông tin user
      localStorage.removeItem("user"); // Xóa thông tin user
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  const showConfirm = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn đăng xuất?",
      content: "Bạn sẽ phải đăng nhập lại để tiếp tục.",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: handleLogout,
    });
  };

  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}
        >
          <div className="container">
            <h1 className="page-title">Tài Khoản</h1>
          </div>
        </div>

        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <div className="container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to='/'><span>Trang Chủ</span></Link>  
              </li>
              <li className="breadcrumb-item">
                <span>Tài Khoản</span>
              </li>
            </ol>
          </div>
        </nav>

        <div className="page-content">
          <div className="container">
            <div className="row">
              {/*thanh điều khiển */}
              <aside className="col-md-4 col-lg-3">
                <ul
                  className="nav nav-dashboard flex-column mb-3 mb-md-0"
                  role="tablist"
                >
                  <li className="nav-item">
                    <Link to={`/dashboard/orders/${client?.id}`}>
                      <span className="nav-link">
                        <BookOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Đơn hàng
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/dashboard/backcl/${client?.id}`}>
                      <span className="nav-link">
                        <RollbackOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Hoàn trả
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/dashboard/info/${client?.id}`}>
                      <span className="nav-link">
                        <UserOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Thông tin
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/dashboard/address/${client?.id}`}>
                      <span className="nav-link">
                        <EnvironmentOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Địa Chỉ
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/">
                      <span className="nav-link">
                        <MessageOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Tin Nhắn
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to={`/dashboard/changepass/${client?.id}`}>
                      <span className="nav-link">
                        <LockOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Đổi mật khẩu
                      </span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={showConfirm}
                      disabled={loading}
                      className="nav-link"
                    >
                      <LogoutOutlined
                        style={{ marginRight: "8px", cursor: "pointer" }}
                      />
                      {loading ? "Đang đăng Xuất..." : "Đăng Xuất"}
                    </button>
                  </li>
                </ul>
              </aside>

              {/* Nội dung động của các trang con */}
              <div className="col-md-8 col-lg-9">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
