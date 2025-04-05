import React from "react";
import { Form, Input, Card, notification } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import "../css/signup.css";
import { LockOutlined } from "@ant-design/icons";
import { AuthServices } from "../services/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const Reset = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { token } = useParams(); // 🔥 Lấy token từ URL
    const userEmail = localStorage.getItem("user_email");

    const { mutate } = useMutation({
        mutationFn: async (user) => {
            const response = await AuthServices.reset(user)
            return response;
        },
        onSuccess: () => {
            notification.success({
                message: "Đặt lại mật khẩu thành công!",
                description: "Hãy đăng nhập để sử dụng dịch vụ.",
            });
            queryClient.invalidateQueries({ queryKey: ["reset-password"] });
            navigate("/logincl");
        },
        onError: (error) => {
            notification.error({
                message: "Xác nhận thất bại",
                description: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
            });
        },
    });

    const handleConfirm = async (values) => {
        mutate(values);
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <h1 className="title">Đặt Lại Mật Khẩu</h1>
                <hr />

                <Form form={form} layout="vertical" onFinish={handleConfirm}>
                    {/* Ẩn input email nhưng vẫn gửi dữ liệu */}
                    <Form.Item name="email" initialValue={userEmail} style={{ display: "none" }}>
                        <Input type="hidden" />
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

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="password_confirmation"
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                            {
                                validator: (_, value) => {
                                    if (!value || value === form.getFieldValue('password')) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            },
                        ]}
                        >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                            className="input-item"
                        />
                    </Form.Item>

                    <Form.Item name="token" initialValue={token} style={{ display: "none" }}>
                        <Input type="hidden" />
                    </Form.Item>

                    <div className="add">
                        <button type="primary" htmlType="submit"  className="btn btn-outline-primary-2">
                            <span>XÁC NHẬN</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Reset;