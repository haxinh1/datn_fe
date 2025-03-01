import React, { useState } from "react";
import { AuthServices } from "./../services/auth";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginAd.css"; // Import CSS tùy chỉnh

const LoginAd = () => {
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Dùng useNavigate thay cho window.location.href

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Kiểm tra xem bạn đã có token hay chưa, nếu có thì thêm vào header
      const adminToken = localStorage.getItem("admin_token");

      const response = await AuthServices.loginad(phone_number, password, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : "", // Thêm token vào header nếu có
        },
      });

      console.log("Phản hồi từ server:", response); // Kiểm tra phản hồi từ API

      if (response && response.access_token) {
        // Lưu access_token và thông tin người dùng vào localStorage
        localStorage.setItem("admin_token", response.access_token); // Lưu `access_token`
        localStorage.setItem("user", JSON.stringify(response.admin)); // Lưu thông tin user

        navigate("/list-pr"); // Điều hướng sau khi đăng nhập thành công
        alert("Đăng nhập thành công");
      } else {
        setError("Không nhận được access_token từ server");
      }
    } catch (err) {
      console.log("Lỗi:", err.response); // Kiểm tra thông tin lỗi
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }

    setLoading(false);
  };
  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="login-box bg-white p-4 rounded shadow-lg">
        <h2 className="text-center mb-3">Admin Login</h2>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          {/* Ô nhập số điện thoại */}
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập số điện thoại"
                value={phone_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Ô nhập mật khẩu */}
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginAd;
