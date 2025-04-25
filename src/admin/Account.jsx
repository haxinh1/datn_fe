import { EditOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, Select, notification, Skeleton, Row, Col, Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import { AuthServices } from '../services/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import "../css/add.css";
import "../css/list.css";
import { Link } from 'react-router-dom';

const Account = () => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [form] = Form.useForm();
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState([]);
    const handleEditCancel = () => setIsEditModalVisible(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: users, isLoading, refetch } = useQuery({
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
        onSuccess: (_, updatedData) => {
            notification.success({
                message: "Cập nhật thành công",
            });
            handleEditCancel();
            refetch();
        
            // Cập nhật lại filteredUsers nếu đang dùng lọc
            setFilteredUsers((prev) => {
                if (!prev) return null; // nếu không lọc, giữ nguyên
                return prev.map((user) =>
                    user.id === selectedRecord.id
                        ? { ...user, ...updatedData }
                        : user
                );
            });
        }        
    });

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

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setLoggedInUserId(userData.id);
            setLoggedInUserRole(userData.role);
        }
    }, []);

    const showEditModal = async (record) => {
        setSelectedRecord(record);
        setIsEditModalVisible(true);

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
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        }
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: "Người dùng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
            render: (fullname, record) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center', gap: '10px' }}>
                    {record.avatar && <Avatar size="large" src={record.avatar} />}
                    <span>{fullname}</span>
                </div>
            ),
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
            title: "Chức năng",
            dataIndex: 'role',
            key: "role",
            align: "center",
            render: (role) => (
                <span className={
                    role === "admin" ? "action-link-green" : role === "manager" ? "action-link-blue" : "action-link-purple"
                }>
                    {role === "admin" ? "Quản lý" : role === "manager" ? "Nhân viên" : "Khách hàng"}
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
                        <Link to={`/admin/staff/${record.id}`}>
                            <Button
                                color="purple"
                                variant="solid"
                                icon={<EyeOutlined />}
                                type='link'
                            />
                        </Link>
                    </Tooltip>
                    {
                        !(record.id === loggedInUserId || loggedInUserRole === 'manager') && (
                            <Tooltip title="Cập nhật">
                                <Button
                                    color="primary"
                                    variant="solid"
                                    icon={<EditOutlined />}
                                    type="link"
                                    onClick={() => showEditModal(record)}
                                />
                            </Tooltip>
                        )
                    }
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <TeamOutlined style={{ marginRight: "8px" }} />
                Danh sách nhân sự
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
                    <Select.Option value="admin">Quản lý</Select.Option>
                </Select>
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers || users}
                    pagination={{ pageSize: 10, current: currentPage }}
                    onChange={(pagination) => setCurrentPage(pagination.current)}
                    bordered
                />
            </Skeleton>

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
