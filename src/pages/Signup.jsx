import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, DatePicker, notification, Row, Col, Card, Upload } from "antd";
import { AuthServices } from "../services/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "../css/signup.css";
import { UploadOutlined } from "@ant-design/icons";

const Signup = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState("");

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then(res => res.json())
            .then(data => {
                setProvinces(data);
                setLoading(false);
            });
    }, []);

    const handleProvinceChange = (value) => {
        const province = provinces.find(p => p.code === Number(value));
        setDistricts(province ? province.districts : []);
        setWards([]);
        form.setFieldsValue({ district: null, ward: null });
    };

    const handleDistrictChange = (value) => {
        const district = districts.find(d => d.code === Number(value));
        setWards(district ? district.wards : []);
        form.setFieldsValue({ ward: null });
    };

    const { mutate } = useMutation({
        mutationFn: async (userData) => {
            const response = await AuthServices.register(userData);
            return response;
        },
        onSuccess: (_, userData) => {
            localStorage.setItem("user_email", userData.email); // 🔥 Lưu email vào localStorage
            notification.success({
                message: "Đăng ký thành công!",
                description: "Hãy kiểm tra Email để kích hoạt tài khoản.",
            });
            navigate("/confirm");
        },
        onError: (error) => {
            notification.error({
                message: "Đăng ký thất bại",
                description: error.message,
            });
        },
    });    

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
          const imageUrl = info.file.response.secure_url;
          setImage(imageUrl);
          form.setFieldsValue({ avatar: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
          setImage(""); // Xóa ảnh khi người dùng xóa
          form.setFieldsValue({ avatar: "" }); // Cập nhật lại giá trị trong form
        }
    };

    const handleRegister = (values) => {
        if (values.password !== values.confirmPassword) {
            notification.error({ message: "Mật khẩu không khớp!" });
            return;
        }
        
        const formattedAddress = [
            values.ward ? wards.find(w => w.code === Number(values.ward))?.name : "",
            values.district ? districts.find(d => d.code === Number(values.district))?.name : "",
            values.province ? provinces.find(p => p.code === Number(values.province))?.name : "",
        ].filter(Boolean).join(", ");
    
        const userData = {
            phone_number: values.phone_number,
            password: values.password,
            password_confirmation: values.confirmPassword,
            fullname: values.fullname,
            address: formattedAddress,
            gender: values.gender,
            birthday: values.birthday.format("YYYY-MM-DD"),
            detail_address: values.detail_address,
            email: values.email,
            avatar: values.avatar,
        };
    
        console.log("Dữ liệu gửi đi:", userData);
        mutate(userData);
    };    

    return (
        <div className="signup-container">
            <Card className="signup-card">
                <h1 className="title">Đăng Ký Tài Khoản</h1>
                <hr />
                <Form form={form} layout="vertical" onFinish={handleRegister}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item 
                                name="fullname" label="Họ và tên" 
                                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                            > 
                                <Input className="input-item" placeholder="Nhập họ và tên"/>
                            </Form.Item>

                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item 
                                        name="gender" label="Giới tính" 
                                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                                    > 
                                        <Select className="input-item" placeholder="Chọn giới tính">
                                            <Select.Option value="male">Nam</Select.Option>
                                            <Select.Option value="female">Nữ</Select.Option>
                                            <Select.Option value="other">Khác</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item 
                                        name="birthday" label="Ngày sinh" 
                                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                                    > 
                                        <DatePicker className="input-item" format="DD/MM/YYYY" placeholder="DD/MM/YYYY"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>    

                        <Col span={12}>
                            <Form.Item
                                label="Ảnh đại diện"
                                name="avatar"
                                getValueFromEvent={(e) => e?.file?.response?.secure_url || ""}
                            >
                                <Upload
                                listType="picture-card"
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{ upload_preset: "quangOsuy" }}
                                onChange={onHandleChange}
                                >
                                {!image && ( 
                                    <button className="upload-button" type="button">
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                    </button>
                                )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item  
                                name="email" label="Email" 
                                rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                            > 
                                <Input className="input-item" placeholder="Nhập Email"/>
                            </Form.Item>

                            <Form.Item  
                                name="phone_number" label="Số điện thoại" 
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            > 
                                <Input className="input-item" placeholder="Nhập số điện thoại"/>
                            </Form.Item>

                            <Form.Item  
                                name="password" label="Mật khẩu" 
                                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                            > 
                                <Input.Password className="input-item" placeholder="Nhập mật khẩu"/>
                            </Form.Item>

                            <Form.Item  
                                name="confirmPassword" label="Xác nhận mật khẩu" 
                                rules={[
                                    { required: true, message: "Vui lòng nhập lại mật khẩu" },
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
                                <Input.Password className="input-item" placeholder="Xác nhận mật khẩu"/>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item 
                                name="province" label="Tỉnh/Thành phố" 
                            > 
                                <Select onChange={handleProvinceChange} loading={loading} className="input-item" placeholder="Chọn tỉnh/thành phố">
                                    {provinces.map(p => <Select.Option key={p.code} value={p.code}>{p.name}</Select.Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item  
                                name="district" label="Quận/Huyện" 
                            > 
                                <Select onChange={handleDistrictChange} disabled={!districts.length} className="input-item" placeholder="Chọn quận/huyện">
                                    {districts.map(d => <Select.Option key={d.code} value={d.code}>{d.name}</Select.Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item  
                                name="ward" label="Phường/Xã" 
                            > 
                                <Select disabled={!wards.length} className="input-item" placeholder="Chọn phường/xã">
                                    {wards.map(w => <Select.Option key={w.code} value={w.code}>{w.name}</Select.Option>)}
                                </Select>
                            </Form.Item>

                            <Form.Item 
                                name="detail_address" label="Địa chỉ cụ thể" 
                            > 
                                <Input className="input-item" placeholder="Nhập địa chỉ cụ thể"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <div className="add">
                        <button type="primary" htmlType="submit" className="btn btn-outline-primary-2">
                            <span>ĐĂNG KÝ</span>
                            <i className="icon-long-arrow-right"></i>
                        </button>
                    </div>
                </Form>
                <div className="form-choice">
                    <p className="text-center"><span>hoặc đăng ký bằng</span></p>
                    <div className="row">
                        <div className="col-sm-6">
                            <a href="#" className="btn btn-login btn-g">
                                <i className="icon-google"></i>
                                Google
                            </a>
                        </div>
                        <div className="col-sm-6">
                            <a href="#" className="btn btn-login btn-f">
                                <i className="icon-facebook-f"></i>
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Signup;
