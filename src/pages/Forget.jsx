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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthServices } from './../services/auth';

const Forget = () => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (user) => {
            const response = await AuthServices.forget(user);
            return response;
        },
        onSuccess: () => {
            notification.success({
                message: "Gửi yêu cầu thành công!",
                description: "Hãy kiếm tra Email của bạn để đặt lại mật khẩu.",
            });
            queryClient.invalidateQueries({ queryKey: ["forgot-password"] });
            form.resetFields();
        },
        onError: (error) => {
            notification.error({
                message: "Xác nhận thất bại",
                description: error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
            });
        },
    });

    const handleConfirm = async (values) => {
        localStorage.setItem("user_email", values.email);
        mutate(values);
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <h1 className="title">Quên Mật Khẩu</h1>
                <span className="text-confirm">Hãy nhập Email của bạn để được hỗ trợ cấp lại mật khẩu.</span>
                <hr />

                <Form form={form} layout="vertical" onFinish={handleConfirm}>
                    <Form.Item
                        className="form-log"
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập Email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input placeholder="Nhập Email" className="input-item"/>
                    </Form.Item>

                    <div className="add">
                        <button type="primary" htmlType="submit"  className="btn btn-outline-primary-2">
                            <span>GỬI</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Forget;
