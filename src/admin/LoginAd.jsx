import React, { useState } from "react";
import { AuthServices } from "./../services/auth";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "../css/loginad.css";

const LoginAd = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");

      const response = await AuthServices.loginad(values.phone_number, values.password, {
        headers: {
          Authorization: adminToken ? `Bearer ${adminToken}` : "",
        },
      });

      if (response && response.access_token) {
        localStorage.setItem("admin_token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.admin));

        message.success("Đăng nhập thành công!");
        navigate("/admin/list-pr");
      } else {
        message.error("Không nhận được access_token từ server");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
    setLoading(false);
  };

  const validatePhoneOrEmail = (_, value) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    if (!value) {
      return Promise.reject("Vui lòng nhập số điện thoại hoặc Email");
    }
  
    if (!phoneRegex.test(value) && !emailRegex.test(value)) {
      return Promise.reject("Nhập sai định dạng. Vui lòng nhập số điện thoại hoặc Email hợp lệ");
    }
  
    return Promise.resolve();
  };

  return (
    <div className="login-container">
      <Card title="Đăng Nhập Quản Lý" className="login-card">
        <Form 
          onFinish={handleLogin} 
          layout="vertical"
        >
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
            className="form-log"
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" className="input-item"/>
          </Form.Item>

          <Button 
            type="primary" htmlType="submit" 
            block loading={loading} className="btn-item"
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginAd;
