import React from "react";
import { Select, Form, Input, Button, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { AuthServices } from "../services/auth";

const Test = () => {
    const [form] = Form.useForm(); // Sử dụng Form của Ant Design

    // useMutation để gọi API đăng ký
    const { mutate, isLoading } = useMutation({
        mutationFn: async (userData) => {
            try {
                const response = await AuthServices.register(userData);
                return response; // Trả về response khi đăng ký thành công
            } catch (error) {
                console.error("Error during registration:", error);
                throw new Error(error.response?.data?.message || "Đã xảy ra lỗi khi đăng ký");
            }
        },
        onSuccess: () => {
            notification.success({
                message: "Đăng ký thành công!",
                description: "Chúc mừng bạn đã đăng ký thành công.",
            });
            form.resetFields(); // Xóa dữ liệu form sau khi đăng ký thành công
        },
        onError: (error) => {
            notification.error({
                message: "Đăng ký thất bại",
                description: error.message,
            });
        },
    });

    // Xử lý khi người dùng ấn nút Submit
    const handleRegister = (values) => {
        const { phone_number, password, password_confirmation } = values;

        if (password !== password_confirmation) {
            notification.error({ message: "Mật khẩu không khớp!" });
            return;
        }

        const cleanedPhoneNumber = phone_number.replace(/\D/g, ""); // Loại bỏ ký tự không hợp lệ

        console.log({
            phone_number: cleanedPhoneNumber,
            password,
            password_confirmation,
        });

        mutate({
            phone_number: cleanedPhoneNumber,
            password,
            password_confirmation,
        });
    };

    return (
        <Form layout="vertical" form={form} onFinish={handleRegister}>
            <Form.Item
                label="Số điện thoại"
                name="phone_number"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Xác nhận mật khẩu"
                name="password_confirmation"
                dependencies={["password"]}
                rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu không khớp!"));
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    Đăng ký
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Test;
