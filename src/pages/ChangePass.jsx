import { EditOutlined, LockOutlined } from "@ant-design/icons";
import { Col, Form, Input, Row, Button, notification } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthServices } from "../services/auth";

const ChangePass = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Hàm xử lý khi submit form
  const handleSubmit = async (values) => {
    // Kiểm tra mật khẩu xác nhận với mật khẩu mới
    if (values.new_password !== values.confirm_password) {
      notification.error({
        message: "Lỗi",
        description: "Mật khẩu xác nhận không khớp với mật khẩu mới!",
      });
      return;
    }

    const userData = {
      current_password: values.current_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };

    try {
      // Gọi API đổi mật khẩu
      const response = await AuthServices.changePassword(id, userData);
      notification.success({
        message: "Đổi mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được thay đổi.",
      });
      navigate("/dashboard");
      console.log(response);
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      notification.error({
        message: "Lỗi khi đổi mật khẩu",
        description:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi thay đổi mật khẩu của bạn.",
      });
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={4}></Col>
          <Col span={8}>
            <h1 className="mb-5" style={{color:'#eea287'}}>
              <LockOutlined style={{ marginRight: "8px" }} />
              Đổi mật khẩu
            </h1>

            <Form.Item
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
              ]}
              name="current_password"
            >
              <Input.Password className="input-item"/>
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="new_password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value !== getFieldValue("current_password")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "Mật khẩu mới không được trùng với mật khẩu hiện tại!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password className="input-item"/>
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                {
                  validator: (_, value) => {
                    if (
                      !value ||
                      value === form.getFieldValue("new_password")
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                },
              ]}
              name="confirm_password"
            >
              <Input.Password className="input-item"/>
            </Form.Item>

            <div className="add">
              <Button type="primary" htmlType="submit" style={{backgroundColor: '#eea287', color:'white'}}>
                Lưu
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ChangePass;
