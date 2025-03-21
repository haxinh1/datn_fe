import { EditOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Skeleton, Image, Modal, Form, Row, Col, Select, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { AuthServices } from '../services/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import "../css/add.css";
import "../css/list.css";
import dayjs from 'dayjs';

const Customer = () => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState([]);
    const [form] = Form.useForm();

    const { data: customer, isLoading, refetch } = useQuery({
        queryKey: ["customer"],
        queryFn: async () => {
            const response = await AuthServices.getAllCustomer();
            console.log("Dữ liệu API:", response);
            return response || [];
        },
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setLoggedInUserId(userData.id);
            setLoggedInUserRole(userData.role); 
        }
    }, []); 

    // Mutation để cập nhật tài khoản
    const updateUserMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await AuthServices.updateUser(selectedRecord.id, updatedData);
        },
        onSuccess: () => {
            notification.success({
                message: "Cập nhật thành công",
            });
            console.log(userData)
            refetch(); // Refresh danh sách người dùng sau khi cập nhật
            handleEditCancel();
        }
    });

    const showEditModal = async (record) => {
        setSelectedRecord(record);
        setIsEditModalVisible(true); // Đặt modal hiển thị trước
    
        try {
            const userData = await AuthServices.getAUser(record.id);
            form.setFieldsValue({
                role: userData.role,
                status: userData.status,
            });
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
    };    

    const handleUpdateUser = async () => {
        try {
            const values = await form.validateFields();
            updateUserMutation.mutate(values);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedRecord(null);
    };

    const showDetailModal = (record) => {
        setSelectedRecord(record);
        setIsDetailModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedRecord(null);
    };

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const detailColumn = [
        {
            title: "Tên người dùng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            align: "center",
            render: (gender) => {
                const genderMap = {
                    male: "Nam",
                    female: "Nữ",
                    other: "Khác"
                };
                return genderMap[gender];
            }
        },        
        {
            title: "Ngày sinh",
            dataIndex: "birthday",
            key: "birthday",
            align: "center",
            render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : null,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            align: "center",
            render: (address) => address?.address
        },
        {
            title: "Địa chỉ cụ thể", 
            dataIndex: "address",
            key: "detail_address",
            align: "center",
            render: (address) => address?.detail_address
        },
    ]

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            align: "center",
        },
        {
            title: "Tên người dùng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
        },
        {
            title: "Ảnh đại diện",
            dataIndex: "avatar",
            key: "avatar",
            render: (avatar) => avatar ? (<Image width={45} src={avatar} />) : null,
            align: "center",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone_number",
            key: "phone_number",
            align: "center",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: "center",
        },
        {
            title: "Chi tiêu (VNĐ)",
            dataIndex: "total_spent",
            key: "total_spent",
            align: "center",
            render: (total_spent) => (total_spent ? formatPrice(total_spent) : ""),
        },
        {
            title: "Hạng khách hàng",
            dataIndex: "rank",
            key: "rank",
            align: "center",
        },
        {
            title: "Điểm tích lũy",
            dataIndex: "loyalty_points",
            key: "loyalty_points",
            align: "center",
        },
        {
            title: "Trạng thái",
            dataIndex: 'status',
            key: "status",
            align: "center",
            render: (status) => (
                <span className={status === "active" ? "action-link-blue" : "action-link-red"}>
                    {status === "active" ? "Hoạt động" : "Dừng hoạt động"}
                </span>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="action-container">
                    <Tooltip title="Xem thêm">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            onClick={() => showDetailModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(record)}
                            disabled={record.id === loggedInUserId || loggedInUserRole === 'manager'}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <TeamOutlined style={{ marginRight: "8px" }} />
                Danh sách khách hàng
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={customer}
                    pagination={{ pageSize: 10 }}
                    bordered
                    rowKey={(record) => record.id}
                />
            </Skeleton>

            <Modal
                title="Chi Tiết Tài Khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
                width={900}
            >
                <Table
                    columns={detailColumn}
                    dataSource={selectedRecord ? [selectedRecord] : []}
                    pagination={false} 
                    bordered
                />
            </Modal>

            <Modal
                title="Cập Nhật Chức Năng Và Trạng Thái Tài Khoản"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
            >
                <Form 
                    layout="vertical"
                    form={form}
                >
                    <Row gutter={24}>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Chức năng"
                                name="role"
                                rules={[{ required: true, message: "Vui lòng chọn chức năng" }]}
                            >
                                <Select
                                    placeholder="Chức năng"
                                    className="input-item"
                                >
                                    <Select.Option value="customer">Khách hàng</Select.Option>
                                    <Select.Option value="manager">Nhân viên</Select.Option>
                                    <Select.Option value="admin">Quản trị viên</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Trạng thái tài khoản"
                                name="status"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                            >
                                <Select
                                    placeholder="Trạng thái"
                                    className="input-item"
                                >
                                    <Select.Option value="active">Hoạt động</Select.Option>
                                    <Select.Option value="inactive">Dừng hoạt động</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button key="submit" type="primary" onClick={handleUpdateUser}>Cập nhật</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Customer;