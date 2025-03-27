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
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    useEffect(() => {
        const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Thay token của bạn vào đây
        fetch(
            "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.data)) {
                    setProvinces(data.data); // Lưu vào state provinces
                }
            })
            .catch((error) => {
                console.error("Lỗi khi lấy dữ liệu tỉnh thành phố:", error);
            });
    }, []);

    // Xử lý sự kiện khi người dùng chọn tỉnh/thành phố
    const handleProvinceChange = (value) => {
        // Reset districts and wards when province changes
        setDistricts([]);
        setWards([]);

        setSelectedProvince(value);

        if (!value) {
            console.error("Invalid province ID:", value);
            return;
        }
        console.log("ProvinceID:", value);
        // Get the ProvinceID instead of Code
        const selectedProvince = provinces.find((p) => p.ProvinceID === value);

        if (!selectedProvince) {
            console.error("Province not found for value:", value);
            return;
        }

        const provinceId = selectedProvince.ProvinceID; // Use the correct ProvinceID

        const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Replace with your actual token
        fetch(
            `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 400) {
                    console.error("Error fetching districts:", data.message);
                } else if (Array.isArray(data.data)) {
                    setDistricts(data.data); // Update districts with the fetched data
                } else {
                    console.error("Unexpected response format:", data);
                }
            })
            .catch((error) => {
                console.error("Error fetching districts:", error);
            });
    };

    // Xử lý sự kiện khi người dùng chọn quận/huyện
    const handleDistrictChange = (value) => {
        setWards([]); // Reset wards when district changes
        setSelectedDistrict(value);
        setSelectedWard(null); // Reset selectedWard when district changes

        if (!value) {
            console.error("Invalid district ID:", value);
            return;
        }
        console.log("DistrictID:", value);
        // Find the district from selected districts
        const selectedDistrictData = districts.find((d) => d.DistrictID === value);
        if (!selectedDistrictData) {
            console.error("District not found for value:", value);
            return;
        }

        const districtId = selectedDistrictData.DistrictID;

        const token = "bc7b2c04-055c-11f0-b2ef-7aa43f19aaea"; // Replace with your actual token
        fetch(
            `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    token: token,
                },
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.data)) {
                    setWards(data.data); // Update wards with the fetched data
                } else {
                    console.error("Error fetching wards:", data);
                }
            })
            .catch((error) => {
                console.error("Error fetching wards:", error);
            });
    };
    const handleWardChange = (value) => {
        setSelectedWard(value); // Cập nhật selectedWard khi chọn phường xã

        if (!value) {
            console.error("Invalid ward code:", value);
            return;
        }

        // Log WardCode khi thay đổi phường xã
        console.log("WardCode:", value);
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
            values.ward
                ? wards.find((w) => w.WardCode === String(values.ward))?.WardName
                : "",
            values.district
                ? districts.find((d) => d.DistrictID === Number(values.district))
                    ?.DistrictName
                : "",
            values.province
                ? provinces.find((p) => p.ProvinceID === Number(values.province))
                    ?.ProvinceName
                : ""
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
            ProvinceID: String(values.province), // Chuyển ProvinceID thành chuỗi
            DistrictID: String(values.district), // DistrictID tương ứng với quận huyện
            WardCode: values.ward, // WardCode tương ứng với phường xã
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
                                <Input className="input-item" placeholder="Nhập họ và tên" />
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
                                        <DatePicker className="input-item" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
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
                                <Input className="input-item" placeholder="Nhập Email" />
                            </Form.Item>

                            <Form.Item
                                name="phone_number" label="Số điện thoại"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input className="input-item" placeholder="Nhập số điện thoại" />
                            </Form.Item>

                            <Form.Item
                                name="password" label="Mật khẩu"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu" },
                                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                                ]}
                            >
                                <Input.Password className="input-item" placeholder="Nhập mật khẩu" />
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
                                <Input.Password className="input-item" placeholder="Xác nhận mật khẩu" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="province" label="Tỉnh/Thành phố"
                            >
                                <Select
                                    onChange={handleProvinceChange}
                                    placeholder="Chọn tỉnh/thành phố"
                                    className="input-item"
                                >
                                    {provinces.map((province) => (
                                        <Select.Option
                                            key={province.ProvinceID} // Sử dụng ProvinceID làm key
                                            value={province.ProvinceID} // Sử dụng ProvinceID làm value
                                        >
                                            {province.ProvinceName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="district" label="Quận/Huyện"
                            >
                                <Select
                                    placeholder="Chọn Quận/Huyện"
                                    className="input-item"
                                    onChange={handleDistrictChange}
                                    disabled={!selectedProvince}
                                >
                                    {districts.map((district) => (
                                        <Select.Option
                                            key={district.DistrictID} // Sử dụng DistrictID làm key
                                            value={district.DistrictID} // Sử dụng DistrictID làm value
                                        >
                                            {district.DistrictName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="ward" label="Phường/Xã"
                            >
                                <Select
                                    placeholder="Chọn Phường/Xã"
                                    className="input-item"
                                    disabled={!selectedDistrict}
                                    onChange={handleWardChange}
                                >
                                    {wards.map((ward) => (
                                        <Select.Option
                                            key={ward.WardCode}
                                            value={ward.WardCode}
                                        >
                                            {ward.WardName}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="detail_address" label="Địa chỉ cụ thể"
                            >
                                <Input className="input-item" placeholder="Nhập địa chỉ cụ thể" />
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
