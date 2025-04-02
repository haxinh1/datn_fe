import React, { useEffect, useState } from "react";
import { AuthServices } from "./../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, notification, Card, message } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import "../css/signup.css";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { cartServices } from "../services/cart";
import { GoogleLogin } from "@react-oauth/google";

const Logincl = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await AuthServices.login(
        values.phone_number,
        values.password
      );
      if (response?.token) {
        localStorage.setItem("client_token", response.token);
        localStorage.setItem("client", JSON.stringify(response.user));
        localStorage.setItem("user", JSON.stringify(response.user));

        message.success("Đăng nhập thành công!");

        // Kiểm tra và đẩy giỏ hàng từ localStorage lên database
        const localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
        if (localCart.length > 0) {
          const userId = response.user.id;
          // Duyệt qua từng sản phẩm trong giỏ hàng và đẩy lên database
          for (let item of localCart) {
            await cartServices.addCartItem(item.product_id, item);
          }

          // Sau khi giỏ hàng được đẩy lên DB, xóa giỏ hàng trong localStorage
          localStorage.removeItem("cart_items");

          message.success("Giỏ hàng của bạn đã được chuyển lên tài khoản!");
        }

        navigate("/dashboard");
      } else {
        notification.error({
          message: "Lỗi",
          description: "Không nhận được token từ server",
        });
      }
    } catch (err) {
      notification.error({
        message: "Đăng nhập thất bại",
        description:
          err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
    setLoading(false);
  };

  const handleGoogleLoginSuccess = (response) => {
    try {
      // Gửi token tới backend để đăng nhập
      const token = response.credential;
      const responseData = AuthServices.loginGoogle(token);

      if (responseData?.token) {
        localStorage.setItem("client_token", responseData.token);
        localStorage.setItem("client", JSON.stringify(responseData.user));
        message.success("Đăng nhập Google thành công!");

        navigate("/");  // Chuyển hướng tới trang chính hoặc dashboard
      }
    } catch (error) {
      notification.error({
        message: "Đăng nhập thất bại",
        description: error.message || "Không thể đăng nhập bằng Google, vui lòng thử lại!",
      });
    }
  };

  const handleGoogleLoginFailure = (error) => {
    notification.error({
      message: "Đăng nhập thất bại",
      description: error.message || "Đăng nhập Google không thành công, vui lòng thử lại!",
    });
  };

  const validatePhoneOrEmail = (_, value) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!value) {
      return Promise.reject("Vui lòng nhập số điện thoại hoặc Email");
    }

    if (!phoneRegex.test(value) && !emailRegex.test(value)) {
      return Promise.reject(
        "Nhập sai định dạng. Vui lòng nhập số điện thoại hoặc Email hợp lệ"
      );
    }

    return Promise.resolve();
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="title">Đăng Nhập</h1>
        <hr />
        <Form form={form} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            className="form-log"
            label="Số điện thoại / Email"
            name="phone_number"
            rules={[{ validator: validatePhoneOrEmail }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập số điện thoại / Email"
              className="input-item"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              className="input-item"
            />
          </Form.Item>

          <div className="form help">
            <Link to="/forget">
              <span className="text-quest">Quên mật khẩu</span>
            </Link>
            <Link to="/signup">
              <span className="text-quest">Bạn chưa có tài khoản?</span>
            </Link>
          </div>

          <div className="add">
            <button
              type="primary"
              htmlType="submit"
              className="btn btn-outline-primary-2"
            >
              <span>ĐĂNG NHẬP</span>
              <i className="icon-long-arrow-right"></i>
            </button>
          </div>
        </Form>

        <div className="form-choice">
          <p className="text-center">
            <span>hoặc đăng nhập bằng</span>
          </p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
              render={(renderProps) => (
                <a
                  href="#"
                  className="btn btn-login btn-g"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >
                  <i className="icon-google"></i>
                  Google
                </a>
              )}
            />
        </div>
      </Card>
    </div>
  );
};

export default Logincl;
