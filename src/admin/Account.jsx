import { BookOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, Select, notification, Skeleton, Row, Col } from 'antd';
import React, { useState } from 'react';
import { AuthServices } from '../services/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const Account = () => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [form] = Form.useForm();

    const { data: users, isLoading, refetch  } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await AuthServices.fetchAuth();
            return response.data;
        },
    });

    // Mutation để cập nhật tài khoản
    const updateUserMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await AuthServices.updateUser(selectedRecord.id, updatedData);
        },
        onSuccess: () => {
            notification.success({
                message: "Cập nhật thành công",
            });
            refetch(); // Refresh danh sách người dùng sau khi cập nhật
            handleEditCancel();
        }
    });

    const showDetailModal = (record) => {
        setSelectedRecord(record);
        setIsDetailModalVisible(true);
    };

    const showEditModal = async (record) => {
        setSelectedRecord(record);

        try {
            const userData = await AuthServices.getAUser(record.id);
            form.setFieldsValue({
                fullname: userData.fullname,
                email: userData.email,
                phone_number: userData.phone_number,
                password: userData.password,
                gender: userData.gender,
                birthday: userData.birthday ? dayjs(userData.birthday) : null,
                address: userData.address,
                detail_address: userData.detail_address,
                role: userData.role,
                status: userData.status,
            });
            setIsEditModalVisible(true);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                ...values,
                birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
            };
            updateUserMutation.mutate(values);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        }
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedRecord(null);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedRecord(null);
    };

    // bấm nút chi tiết
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
            title: "Địa chỉ cụ thể",  // Cột để hiển thị detail_address
            dataIndex: "address",   // Lấy dữ liệu từ address
            key: "detail_address",
            align: "center",
            render: (address) => address?.detail_address  // Hiển thị detail_address từ address
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
            title: "Điểm tích lũy",
            dataIndex: "loyalty_point",
            key: "loyalty_point",
            align: "center",
        },
        {
            title: "Chức năng",
            dataIndex: 'role',
            key: "role",
            align: "center",
            render: (role) => (
                <span className={
                    role === "admin" ? "action-link-green" : role === "manager" ? "action-link-blue" : "action-link-purple"
                }>
                    {role === "admin" ? "Quản trị viên" : role === "manager" ? "Nhân viên" : "Khách hàng"}
                </span>
            ),
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
                            type='link'
                            onClick={() => showDetailModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined/>}
                            type="link"
                            onClick={() => showEditModal(record)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <BookOutlined style={{ marginRight: "8px" }} />
                Danh sách tài khoản
            </h1>

            <div className="group1">
                <Select
                    placeholder="Chức năng"
                    className="select-item"
                    allowClear
                    onChange={(value) => {
                        const filteredUsers = value ? users.filter(user => user.role === value) : users;
                        setFilteredUsers(filteredUsers);
                    }}
                >
                    <Select.Option value="customer">Khách hàng</Select.Option>
                    <Select.Option value="manager">Nhân viên</Select.Option>
                    <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers || users}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Skeleton>

            {/* Modal Chi Tiết */}
            <Modal
                title="Chi Tiết Tài Khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
                width={900}
            >
                <Table
                    columns={detailColumn}
                    dataSource={selectedRecord ? [selectedRecord] : []} // Chỉ hiển thị thông tin khách hàng đã chọn
                    pagination={false} // Không cần phân trang vì chỉ có một bản ghi
                    bordered
                />
            </Modal>

            {/* Modal Cập Nhật */}
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

export default Account;
