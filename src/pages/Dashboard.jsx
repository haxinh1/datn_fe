import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { BookOutlined, CloseCircleOutlined, EnvironmentOutlined, LockOutlined, RollbackOutlined, UserOutlined } from "@ant-design/icons";
import headerBg from "../assets/images/page-header-bg.jpg";

const Dashboard = () => {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const storedClient = JSON.parse(localStorage.getItem("user"));
    setClient(storedClient);
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
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setClient(user);

        // Xóa query khỏi URL để sạch sẽ
        window.history.replaceState(null, "", window.location.pathname);
      } catch (err) {
        console.error("Lỗi khi parse user từ query:", err);
      }
    } else {
      // Nếu không có token/user trong URL, lấy từ localStorage
      const storedClient = JSON.parse(localStorage.getItem("user"));
      if (storedClient) {
        setClient(storedClient);
      }
    }
  }, []);

  const isGoogleAccount = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return false;
      const parsedUser = JSON.parse(storedUser);
      return !!parsedUser.google_id;
    } catch (err) {
      console.error("Lỗi khi parse user từ localStorage:", err);
      return false;
    }
  };

  return (
    <div>
      <main className="main">
        <div
          className="page-header text-center"
          style={{ backgroundImage: `url(${headerBg})` }}
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
                    <Link to={`/dashboard/cancels/${client?.id}`}>
                      <span className="nav-link">
                        <CloseCircleOutlined
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        Đơn hủy
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

                  {!isGoogleAccount() && (
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
                  )}
                </ul>
              </aside>

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