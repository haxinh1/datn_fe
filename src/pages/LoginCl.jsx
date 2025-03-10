import React, { useEffect, useState } from "react";
import { AuthServices } from "./../services/auth";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import { useMutation } from "@tanstack/react-query";

const Logincl = () => {
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Dùng useNavigate thay cho window.location.href

  // Sử dụng useMutation để gọi API đăng ký
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await AuthServices.login(phone_number, password);
      console.log("Phản hồi từ server:", response); // Kiểm tra API trả về gì

      if (response && response.token) {
        //Kiểm tra `token` thay vì `access_token`
        localStorage.setItem("client_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user)); // Lưu thông tin user
        console.log("Token sau khi lưu:", localStorage.getItem("client_token"));
        navigate("/");
        alert("Đăng nhập thành công");
      } else {
        setError("Không nhận được token từ server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }

    setLoading(false);
  };

  return (
    <div className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17">
      <div className="container">
        <div className="form-box">
          <div className="form-tab">
            <ul className="nav nav-pills nav-fill">
              <li className="nav-item">
                <a className="nav-link active">Đăng Nhập</a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active">
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      value={phone_number}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && <p className="text-danger">{error}</p>}
                  <div className="form-footer">
                    <button type="submit" className="btn btn-outline-primary-2">
                      <span>Đăng nhập</span>
                      <i className="icon-long-arrow-right"></i>
                    </button>
                  </div>
                </form>
                <div className="form-choice">
                  <p className="text-center">or sign in with</p>
                  <div className="row">
                    <div className="col-sm-6">
                      <a href="#" className="btn btn-login btn-g">
                        <i className="icon-google"></i>
                        Đăng nhập với Google
                      </a>
                    </div>
                    <div className="col-sm-6">
                      <a href="#" className="btn btn-login btn-f">
                        <i className="icon-facebook-f"></i>
                        Đăng nhập với Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logincl;
