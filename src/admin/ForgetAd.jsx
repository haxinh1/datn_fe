import React, { useState } from "react";
import { Form, Input, Card, notification, Button } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/bootstrap.min.css";
import "../assets/css/style.css";
import "../css/loginad.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthServices } from "./../services/auth";
import { UserOutlined } from "@ant-design/icons";

const ForgetAd = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const { mutate } = useMutation({
        mutationFn: async (user) => {
            setLoading(true);
            return await AuthServices.forget(user);
        },
        onSuccess: () => {
            notification.success({
                message: "Gửi yêu cầu thành công!",
                description: "Hãy kiểm tra Email của bạn để đặt lại mật khẩu.",
            });
            queryClient.invalidateQueries({ queryKey: ["forgot-password"] });
            setLoading(false);
            form.resetFields();
        },
        onError: (error) => {
            notification.error({
                message: "Xác nhận thất bại",
                description: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
            });
            setLoading(false);
        },
    });

    const handleConfirm = async (values) => {
        localStorage.setItem("user_email", values.email);
        mutate(values);
    };

    return (
        <div className="loginad-container">
            <Card title="Quên Mật Khẩu" className="login-card">
                <span className="text-confirm">Hãy nhập Email của bạn để được hỗ trợ cấp lại mật khẩu.</span>
                <Form onFinish={handleConfirm} layout="vertical" form={form}>
                    <Form.Item
                        className="form-log"
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập Email" },
                            { type: "email", message: "Email không hợp lệ" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập Email"
                            className="input-item"
                        />
                    </Form.Item>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        className="btn-item"
                        loading={loading}
                    >
                        Gửi
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default ForgetAd;
