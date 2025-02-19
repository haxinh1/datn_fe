import { BookOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal } from 'antd';
import React, { useState } from 'react';

const Account = () => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const showDetailModal = (record) => {
        setSelectedRecord(record);
        setIsDetailModalVisible(true);
    };

    const showEditModal = (record) => {
        setSelectedRecord(record);
        setIsEditModalVisible(true);
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedRecord(null);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setSelectedRecord(null);
    };

    const data = [
        {
            key: '1',
            fullname: 'Nguyễn Văn A',
            phone_number: '0123456789',
            email: 'nguyenvana@example.com',
            password: '******',
            loyalty_point: 100,
            role: 'Admin',
            status: 'Active',
        },
        {
            key: '2',
            fullname: 'Trần Thị B',
            phone_number: '0987654321',
            email: 'tranthib@example.com',
            password: '******',
            loyalty_point: 200,
            role: 'User',
            status: 'Inactive',
        }
    ];

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
            title: "Điểm",
            key: "loyalty_point",
            align: "center",
        },
        {
            title: "Vai trò",
            key: "role",
            align: "center",
        },
        {
            title: "Trạng thái",
            key: "status",
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết">
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
                dataSource={data}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Chi Tiết */}
            <Modal
                title="Chi Tiết Tài Khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
            >
                {selectedRecord && (
                    <div>
                        <p><strong>Tên:</strong> {selectedRecord.fullname}</p>
                        <p><strong>Email:</strong> {selectedRecord.email}</p>
                        <p><strong>Số điện thoại:</strong> {selectedRecord.phone_number}</p>
                    </div>
                )}
            </Modal>

            {/* Modal Cập Nhật */}
            <Modal
                title="Cập Nhật Tài Khoản"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
            >
                {selectedRecord && (
                    <div>
                        <p>Cập nhật thông tin cho {selectedRecord.fullname}</p>
                        {/* Form cập nhật có thể thêm vào đây */}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Account;
