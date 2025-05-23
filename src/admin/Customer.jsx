import { EditOutlined, EyeOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Skeleton, Modal, Form, Row, Col, Select, notification, Avatar, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { AuthServices } from '../services/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import "../css/add.css";
import "../css/list.css";
import { Link } from 'react-router-dom';

const Customer = () => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    const [loggedInUserRole, setLoggedInUserRole] = useState([]);
    const [form] = Form.useForm();
    const handleEditCancel = () => setIsEditModalVisible(false)
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchKeyword, setSearchKeyword] = useState("");
    const queryClient = useQueryClient();

    const { data: customer, isLoading, refetch } = useQuery({
        queryKey: ["customer", searchKeyword],
        queryFn: async () => {
            return searchKeyword
                ? await AuthServices.searchUsers(searchKeyword)
                : await AuthServices.getAllCustomer();
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
        onSuccess: (updatedData) => {
            notification.success({
                message: "Cập nhật thành công",
            });
            handleEditCancel();

            // Cập nhật lại dữ liệu hiển thị mà không cần refetch
            if (customer) {
                const updatedList = customer.map(user =>
                    user.id === selectedRecord.id ? { ...user, ...updatedData } : user
                );
                setSelectedRecord(null);
                queryClient.setQueryData(["customer", searchKeyword], updatedList);
            }
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

            if (values.status === "banned") {
                Modal.confirm({
                    title: "Bạn chắc chắn muốn khóa tài khoản này?",
                    okText: "Xác nhận",
                    cancelText: "Hủy",
                    onOk: () => {
                        updateUserMutation.mutate(values);
                    },
                });
            } else {
                updateUserMutation.mutate(values);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
        }
    };

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Khách hàng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
            render: (fullname, record) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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
            title: "Chi tiêu (VNĐ)",
            dataIndex: "total_spent",
            key: "total_spent",
            align: "center",
            render: (total_spent) => (total_spent ? formatPrice(total_spent) : ""),
        },
        {
            title: "Hạng",
            dataIndex: "rank",
            key: "rank",
            align: "center",
        },
        {
            title: "Điểm tiêu dùng",
            dataIndex: "loyalty_points",
            key: "loyalty_points",
            align: "center",
            render: (loyalty_points) => (loyalty_points ? formatPrice(loyalty_points) : ""),
        },
        {
            title: "Trạng thái",
            dataIndex: 'status',
            key: "status",
            align: "center",
            render: (status) => (
                <span className={status === "active" ? "action-link-blue" : "action-link-red"}>
                    {status === "active"
                        ? "Hoạt động"
                        : status === "banned"
                            ? "Đã khóa"
                            : "Dừng hoạt động"}
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
                        <Link to={`/admin/user/${record.id}`}>
                            <Button
                                color="purple"
                                variant="solid"
                                icon={<EyeOutlined />}
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
                Danh sách khách hàng
            </h1>

            <Input.Search
                className="search-input"
                placeholder="Tìm kiếm khách hàng..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearchKeyword}
            />

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={customer}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                    }}
                    bordered
                    rowKey={(record) => record.id}
                />
            </Skeleton>

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
                                    <Select.Option value="banned">Khóa</Select.Option>
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