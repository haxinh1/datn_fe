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

const Forget = () => {
    const [form] = Form.useForm();

    return (
        <div className="login-container">
            <Card className="login-card">
                <h1 className="title">Quên Mật Khẩu</h1>
                <p className="text-confirm">Hãy nhập Email của bạn để được hỗ trợ cấp lại mật khẩu.</p>
                <hr />

                <Form form={form} layout="vertical" >
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
                            <span>XÁC NHẬN</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Forget;
