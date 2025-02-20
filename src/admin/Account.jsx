import { BookOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, InputNumber, DatePicker, Switch, Input, Select, notification } from 'antd';
import React, { useState } from 'react';
import { AuthServices } from '../services/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const Account = () => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [form] = Form.useForm();

    const { data: users, refetch  } = useQuery({
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
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            align: "center",
        },
        {
            title: "Ngày sinh",
            dataIndex: "birthday",
            key: "birthday",
            align: "center",
            render: (date) => date ? dayjs(date).format("DD/MM/YY") : null,
        },
        {
            title: "Điểm tích lũy",
            dataIndex: "loyalty_point",
            key: "loyalty_point",
            align: "center",
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
            title: "Mật khẩu",
            key: "password",
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
                <span className={
                    status === "active" ? "action-link-green" : status === "inactive" ? "action-link-blue" : "action-link-red"
                }>
                    {status === "active" ? "Hoạt động" : status === "inactive" ? "Dừng hoạt động" : "Khóa"}
                </span>
            ),
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

            <Table
                columns={columns}
                dataSource={users}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Chi Tiết */}
            <Modal
                title="Chi Tiết Tài Khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
                width={600}
            >
                <Table
                    columns={detailColumn}
                    dataSource={users}
                    pagination={{ pageSize: 10 }}
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
                    {/* <Form.Item
                        label="Tên người dùng"
                        rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
                        name="fullname"
                    >
                        <Input className="input-item" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        rules={[{ required: true, message: "Vui lòng nhập Email" }]}
                        name="email"
                    >
                        <Input type="email" className="input-item" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        name="phone_number"
                    >
                        <Input className="input-item" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu" },
                            { min: 8, message: "Mật khẩu phải có tối thiểu 8 ký tự" },
                        ]}
                        name="password"
                    >
                        <Input.Password className="input-item" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        rules={[
                            { required: true, message: "Vui lòng nhập lại mật khẩu" },
                            { min: 8, message: "Mật khẩu phải có tối thiểu 8 ký tự" },
                        ]}
                        name="confirm_password"
                    >
                        <Input.Password type="password" className="input-item" />
                    </Form.Item>

                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                    >
                        <Select
                            placeholder="Chọn giới tính"
                            className="input-item"
                        >
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                            <Select.Option value="other">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ngày sinh"
                        name="birthday"
                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                    >
                        <DatePicker format="DD/MM/YYYY" className="input-item" />
                    </Form.Item> */}

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

                    <div className="add">
                        <Button key="submit" type="primary" onClick={handleUpdateUser}>Cập nhật</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Account;
