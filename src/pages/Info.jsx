import {
    Skeleton,
    Table,
    notification,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Upload,
    Tooltip,
    Avatar,
} from "antd";
import React, { useEffect, useState } from "react";
import { AuthServices } from "../services/auth";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { EditOutlined, EyeOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";

const Info = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [image, setImage] = useState(null);
    const [isModal, setIsModal] = useState(false);
    const [pointHistory, setPointHistory] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AuthServices.getAUser(id);
                const formattedUser = {
                    fullname: userData.fullname,
                    phone_number: userData.phone_number,
                    email: userData.email,
                    gender: userData.gender || "",
                    birthday: userData.birthday ? dayjs(userData.birthday) : null,
                    avatar: userData.avatar,
                    total_spent: userData.total_spent,
                    rank: userData.rank,
                    loyalty_points: userData.loyalty_points,
                    created_at: userData.created_at,
                };
                setUser(formattedUser);

                // Chuyển đổi URL ảnh thành file khi có ảnh
                if (userData.avatar) {
                    const fileList = await convertImagesToFileList([userData.avatar]);
                    setImage(fileList[0]);
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

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const data = await AuthServices.getPointByUser(id);
                setPointHistory(data);
            } catch (err) {
                console.error("Lỗi khi lấy lịch sử điểm:", err);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải lịch sử điểm của người dùng.",
                });
            }
        };

        if (id) fetchPoints();
    }, [id]);

    const handleUpdate = async (values) => {
        try {
            const userData = {
                ...values,
                avatar: image ? image.url : null,
                gender: values.gender || null,
                birthday: values.birthday ? dayjs(values.birthday).format("YYYY-MM-DD") : null,
            };
            const response = await AuthServices.update(id, userData);

            // Cập nhật state user để render lại bảng
            setUser({
                ...user,
                fullname: response.fullname,
                phone_number: response.phone_number,
                email: response.email,
                gender: response.gender,
                birthday: response.birthday ? dayjs(response.birthday) : null,
                avatar: response.avatar,
            });

            // Cập nhật localStorage
            const updatedClient = {
                ...JSON.parse(localStorage.getItem("client")),
                fullname: response.fullname,
                phone_number: response.phone_number,
                email: response.email,
                avatar: response.avatar,
            };
            localStorage.setItem("client", JSON.stringify(updatedClient));
            localStorage.setItem("user", JSON.stringify(updatedClient));

            // Phát sự kiện user-updated
            window.dispatchEvent(new Event("user-updated"));

            // Cập nhật image state nếu avatar thay đổi
            if (response.avatar && response.avatar !== user.avatar) {
                const fileList = await convertImagesToFileList([response.avatar]);
                setImage(fileList[0]);
            }

            notification.success({
                message: "Cập nhật thành công!",
            });
            setIsModalVisible(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
                description: error.message || "Không thể cập nhật thông tin.",
            });
        }
    };

    const isGoogleAccount = () => {
        try {
            const storedUser = localStorage.getItem("client");
            if (!storedUser) return false;
            const parsedUser = JSON.parse(storedUser);
            return !!parsedUser.google_id;
        } catch (err) {
            console.error("Lỗi khi parse user từ localStorage:", err);
            return false;
        }
    };

    const onHandleChange = ({ fileList }) => {
        // Chỉ giữ một ảnh
        fileList = fileList.slice(-1);
        if (fileList.length > 0 && fileList[0].status === "done" && fileList[0].response) {
            fileList[0].url = fileList[0].response.secure_url;
        }
        setImage(fileList[0] || null);
    };

    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    const convertImagesToFileList = async (imageUrls) => {
        return Promise.all(
            imageUrls.map(async (url, index) => {
                const file = await urlToFile(url, `image-${index}.jpg`);
                return {
                    uid: `img-${index}`,
                    name: file.name,
                    status: "done",
                    url,
                    originFileObj: file,
                };
            })
        );
    };

    const showModal = () => {
        form.setFieldsValue({
            fullname: user.fullname,
            phone_number: user.phone_number,
            email: user.email,
            gender: user.gender || "",
            birthday: user.birthday,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const showPoint = () => {
        setIsModal(true);
    };

    const hidePoint = () => {
        setIsModal(false);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        }).format(price);
    };

    const userColumns = [
        {
            title: "Thông tin",
            dataIndex: "label",
            key: "label",
            width: 200,
        },
        {
            title: "Chi tiết",
            dataIndex: "value",
            key: "value",
            width: 200,
        },
    ];

    const dataSource = user
        ? [
            {
                key: "avatar",
                label: "Ảnh đại diện",
                value: user.avatar ? <Avatar size={100} src={user.avatar} /> : <Avatar size={100} icon={<UserOutlined />} />,
            },
            {
                key: "fullname",
                label: "Tên người dùng",
                value: user.fullname,
            },
            {
                key: "phone_number",
                label: "Số điện thoại",
                value: user.phone_number,
            },
            {
                key: "email",
                label: "Email",
                value: user.email,
            },
            {
                key: "gender",
                label: "Giới tính",
                value: user.gender ? { male: "Nam", female: "Nữ", other: "Khác" }[user.gender] : "",
            },
            {
                key: "birthday",
                label: "Ngày sinh",
                value: user.birthday ? user.birthday.format("DD/MM/YYYY") : "",
            },
            {
                key: "action",
                value: (
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#eea287", color: "white" }}
                        icon={<EditOutlined />}
                        onClick={showModal}
                    >
                        Cập nhật
                    </Button>
                ),
            },
        ]
        : [];

    const data = user
        ? [
            {
                key: "created_at",
                label: "Ngày đăng ký",
                value: <div className="action-link-blue">{dayjs(user.created_at).format("DD/MM/YYYY")}</div>,
            },
            {
                key: "total_spent",
                label: "Chi tiêu (VNĐ)",
                value: formatPrice(user.total_spent),
            },
            {
                key: "rank",
                label: "Hạng",
                value: user.rank,
            },
            {
                key: "loyalty_points",
                label: "Điểm tiêu dùng",
                value: (
                    <div className="group1">
                        <div className="action-link-blue">{formatPrice(user.loyalty_points)}</div>
                        <Tooltip title="Chi tiết">
                            <Button type="text" icon={<EyeOutlined />} onClick={showPoint} />
                        </Tooltip>
                    </div>
                ),
            },
        ]
        : [];

    const getPointColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "order_code",
            align: "center",
        },
        {
            title: "Điểm",
            dataIndex: "points",
            align: "center",
            render: (value) => (
                <span style={{ color: value > 0 ? "green" : "red" }}>
                    {value > 0 ? `+${formatPrice(value)}` : formatPrice(value)}
                </span>
            ),
        },
        {
            title: "Ghi chú",
            dataIndex: "reason",
            align: "center",
        },
        {
            title: "Thời gian",
            dataIndex: "date",
            align: "center",
            sorter: (a, b) => dayjs(a.date, "DD/MM/YYYY HH:mm").unix() - dayjs(b.date, "DD/MM/YYYY HH:mm").unix(),
        },
    ];

    const getPointDataSource = (history) =>
        history.map((item, index) => ({
            key: item.id,
            index: index + 1,
            order_code: item.order?.code,
            points: item.points,
            type: item.type,
            reason: item.reason,
            date: dayjs(item.created_at).format("DD/MM/YYYY HH:mm"),
        }));

    return (
        <>
            <h1 className="mb-5" style={{ color: "#eea287" }}>
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
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người dùng"
                                name="fullname"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input className="input-item" />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                name="phone_number"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Ảnh đại diện" name="avatar">
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{ upload_preset: "quangOsuy" }}
                                    fileList={image ? [image] : []}
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
                                name="email"
                                rules={[{ required: true, message: "Vui lòng nhập Email" }]}
                            >
                                <Input className="input-item" disabled={isGoogleAccount()} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item
                                        name="gender"
                                        label="Giới tính"
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
                                        name="birthday"
                                        label="Ngày sinh"
                                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                                    >
                                        <DatePicker
                                            className="input-item"
                                            format="DD/MM/YYYY"
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button
                            type="primary"
                            style={{ backgroundColor: "#eea287", color: "white" }}
                            htmlType="submit"
                        >
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Điểm tiêu dùng"
                visible={isModal}
                onCancel={hidePoint}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={getPointDataSource(pointHistory)}
                    columns={getPointColumns}
                    pagination={{ pageSize: 5 }}
                />
            </Modal>
        </>
    );
};

export default Info;