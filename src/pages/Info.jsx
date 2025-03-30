import { Skeleton, Table, notification, Image, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Upload, Tooltip, Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import { AuthServices } from '../services/auth';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { EditOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';

const Info = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [image, setImage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AuthServices.getAUser(id);
                setUser({
                    fullname: userData.fullname,
                    phone_number: userData.phone_number,
                    email: userData.email,
                    gender: userData.gender || "",
                    birthday: userData.birthday ? dayjs(userData.birthday) : null,
                    avatar: userData.avatar,
                    total_spent: userData.total_spent,
                    rank: userData.rank,
                    loyalty_points: userData.loyalty_points,
                });

                // Chuyển đổi URL ảnh thành file khi có ảnh
                if (userData.avatar) {
                    const fileList = await convertImagesToFileList([userData.avatar]);
                    setImage(fileList[0]);  // Cập nhật state image với file đầu tiên
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải dữ liệu người dùng.",
                });
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    const handleUpdate = async (values) => {
        try {
            const userData = {
                ...values,
                avatar: image ? image.url : values.avatar || null,
                gender: values.gender || null,
                birthday: values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : null,
            };
            const response = await AuthServices.update(id, userData); // Gọi API để cập nhật
            notification.success({
                message: "Cập nhật thành công!",
            });
            form.resetFields();
            setIsModalVisible(false);
            console.log("Dữ liệu đã cập nhật:", response);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
                description: "Không thể cập nhật thông tin.",
            });
        }
    };

    const onHandleChange = (info) => {
        let fileList = [...info.fileList];

        // Nếu ảnh mới được upload thành công, cập nhật `thumbnail`
        if (info.file.status === "done" && info.file.response) {
            fileList = fileList.map((file) => ({
                uid: file.uid,
                name: file.name,
                status: "done",
                url: file.response.secure_url, // Lấy URL từ response Cloudinary
            }));
        }

        // Cập nhật state
        setImage(fileList.length > 0 ? fileList[0] : null);
    };

    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    const convertImagesToFileList = async (imageUrls) => {
        const fileList = await Promise.all(
            imageUrls.map(async (url, index) => {
                const file = await urlToFile(url, `image-${index}.jpg`);
                return {
                    uid: `img-${index}`,
                    name: file.name,
                    status: "done",
                    url, // Giữ lại URL để hiển thị
                    originFileObj: file, // Chuyển đổi thành File object
                };
            })
        );
        return fileList;
    };


    const showModal = () => {
        form.setFieldsValue({
            fullname: user.fullname,
            phone_number: user.phone_number,
            email: user.email,
            gender: user.gender || "",
            birthday: user.birthday ? dayjs(user.birthday) : null,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const userColumns = [
        {
            title: "Thông tin",
            dataIndex: "label",
            key: "label",
            width: 160,
        },
        {
            title: "Chi tiết",
            dataIndex: "value",
            key: "value",
        },
    ];

    const dataSource = user ? [
        {
            key: "avatar",
            label: "Ảnh đại diện",
            value: user.avatar ? <Avatar size={100} src={user.avatar} /> : "",
        },
        {
            key: "fullname",
            label: "Tên người dùng",
            value: user.fullname
        },
        {
            key: "phone_number",
            label: "Số điện thoại",
            value: user.phone_number
        },
        {
            key: "email",
            label: "Email",
            value: user.email
        },
        {
            key: "gender",
            label: "Giới tính",
            value: user.gender ? { male: "Nam", female: "Nữ", other: "Khác" }[user.gender] : "",
        },
        {
            key: "birthday",
            label: "Ngày sinh",
            value: user.birthday ? user.birthday.format("DD/MM/YYYY") : ""
        },
        {
            key: "action",
            value: (
                <Button style={{backgroundColor: '#e48948', color:'white'}} icon={<EditOutlined />} onClick={showModal}>
                    Cập nhật
                </Button>
            ),
        },
    ] : [];

    const data = user ? [
        {
            key: 'created_at',
            label: 'Ngày đăng ký',
            value: <div className="action-link-blue">{dayjs(user.created_at).format("DD/MM/YYYY")}</div>
        },
        {
            key: "total_spent",
            label: "Chi tiêu (VNĐ)",
            value: formatPrice(user.total_spent)
        },
        {
            key: "rank",
            label: "Hạng",
            value: user.rank
        },
        {
            key: "loyalty_points",
            label: "Diểm tích lũy",
            value: formatPrice(user.loyalty_points)
        },
    ] : [];

    return (
        <>
            <h1 className="mb-5" style={{color:'#e48948'}}>
                <UserOutlined style={{ marginRight: "8px" }} />
                Thông tin của bạn
            </h1>

            <div className="group1">
                <Skeleton active loading={isLoading}>
                    {user && (
                        <Table
                            columns={userColumns}
                            dataSource={dataSource}
                            pagination={false}
                            showHeader={false}
                        />
                    )}
                </Skeleton>

                <Skeleton active loading={isLoading}>
                    {user && (
                        <Table
                            columns={userColumns}
                            dataSource={data}
                            pagination={false}
                        />
                    )}
                </Skeleton>
            </div>

            <Modal
                title="Cập nhật thông tin"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người dùng"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                                name="fullname"
                            >
                                <Input className="input-item" />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                name="phone_number"
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Ảnh đại diện"
                                name="avatar"
                            >
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{ upload_preset: "quangOsuy" }}
                                    fileList={image ? [image] : []} // ✅ Hiển thị ảnh đã tải lên
                                    onChange={onHandleChange}
                                    onRemove={() => setImage(null)}
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
                                label="Email"
                                rules={[{ required: true, message: "Vui lòng nhập Email" }]}
                                name="email"
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
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
                    </Row>

                    <div className="add">
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default Info;
