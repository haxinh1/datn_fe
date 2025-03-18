import React, { useState } from "react";
import { Form, Input, Card, notification } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthServices } from "../services/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/plugins/owl-carousel/owl.carousel.css";
import "../assets/css/plugins/magnific-popup/magnific-popup.css";
import "../assets/css/plugins/jquery.countdown.css";
import "../assets/css/style.css";
import "../assets/css/skins/skin-demo-8.css";
import "../assets/css/demos/demo-8.css";
import "../css/signup.css";

const Confirm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const { mutate } = useMutation({
        mutationFn: async (user) => {
            const response = await AuthServices.verify(user);
            return response;
        },
        onSuccess: () => {
            notification.success({
                message: "Xác nhận thành công!",
                description: "Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập để sử dụng dịch vụ.",
            });
            queryClient.invalidateQueries({ queryKey: ["verify-email"] });
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
        setLoading(true);
        mutate(values);
        setLoading(false);
    };

    const userEmail = localStorage.getItem("user_email"); // 🔥 Lấy email từ localStorage

    return (
        <div className="login-container">
            <Card className="login-card">
                <h1 className="title">Xác Nhận Email</h1>
                <span className="text-confirm">Hãy kiểm tra Email và nhập mã xác nhận để kích hoạt tài khoản.</span>
                <hr />

                <Form form={form} layout="vertical" onFinish={handleConfirm}>
                    {/* Ẩn input email nhưng vẫn gửi dữ liệu */}
                    <Form.Item name="email" initialValue={userEmail} style={{ display: "none" }}>
                        <Input type="hidden" />
                    </Form.Item>

                    <Form.Item
                        className="form-log"
                        label="Mã xác nhận"
                        name="verification_code"
                        rules={[{ required: true, message: "Vui lòng nhập mã xác nhận" }]}
                    >
                        <Input placeholder="Nhập mã xác nhận" className="input-item"/>
                    </Form.Item>

                    <div className="add">
                        <button type="primary" htmlType="submit" loading={loading} className="btn btn-outline-primary-2">
                            <span>XÁC NHẬN</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Confirm;
