import React, { useEffect, useState } from "react";
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
    const [timeLeft, setTimeLeft] = useState(120);

    const { mutate } = useMutation({
        mutationFn: async (user) => {
            const response = await AuthServices.verify(user);
            return response;
        },
        onSuccess: () => {
            localStorage.removeItem("verify_start_time");
            localStorage.removeItem("user_email");
            
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

    const startTimer = () => {
        const interval = setInterval(() => {
            const startTime = parseInt(localStorage.getItem("verify_start_time"), 10);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = 120 - elapsed;

            if (remaining <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return interval;
    };

    useEffect(() => {
        const startTime = parseInt(localStorage.getItem("verify_start_time"), 10);
        if (!startTime) return;

        const intervalId = startTimer();
        return () => clearInterval(intervalId);
    }, []);

    const handleResendCode = async () => {
        try {
            await AuthServices.resend({ email: userEmail });
            const newStartTime = Date.now();
            localStorage.setItem("verify_start_time", newStartTime.toString());
            setTimeLeft(120);
            startTimer(); // 🔥 Bắt đầu lại đếm ngược

            notification.success({
                message: "Đã gửi lại mã xác nhận",
                description: "Vui lòng kiểm tra email của bạn.",
            });
        } catch (error) {
            notification.error({
                message: "Gửi lại mã thất bại",
                description: error.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
            });
        }
    };

    const userEmail = localStorage.getItem("user_email"); // 🔥 Lấy email từ localStorage

    return (
        <div className="login-container">
            <Card className="login-card">
                <h1 className="title">Xác Nhận Email</h1>
                <span className="text-confirm">Hãy kiểm tra Email và nhập mã xác nhận để kích hoạt tài khoản.</span>

                <hr />

                <Form form={form} layout="vertical" onFinish={handleConfirm}>

                    <Form.Item name="email" initialValue={userEmail} style={{ display: "none" }}>
                        <Input type="hidden" />
                    </Form.Item>

                    <Form.Item
                        className="form-log"
                        label="Mã xác nhận"
                        name="verification_code"
                        rules={[{ required: true, message: "Vui lòng nhập mã xác nhận" }]}
                    >
                        <Input
                            placeholder="Nhập mã xác nhận"
                            className="input-item"
                            disabled={timeLeft === 0}
                        />
                    </Form.Item>

                    <div className="add">
                        <button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={timeLeft === 0}
                            className="btn btn-outline-primary-2"
                        >
                            <span>XÁC NHẬN</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>

                </Form>

                {timeLeft > 0 ? (
                    <span className="w-warning">
                        Mã xác nhận sẽ hết hạn sau {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                    </span>
                ) : (
                    <span className="w-fail">
                        Mã xác nhận đã hết hạn!{" "}
                        <a onClick={handleResendCode} style={{ cursor: "pointer", textDecoration: "underline" }}>
                            <span className="w-fail">Gửi lại mã</span>
                        </a>
                    </span>
                )}

            </Card>
        </div>
    );
};

export default Confirm;
