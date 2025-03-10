import { BookOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, Select, notification, Skeleton, Row, Col } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';

const Coupon = () => {
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isActive, setIsActive] = useState(1);    
    const [form] = Form.useForm();

    const showDetailModal = (record) => {
        setSelectedRecord(record);
        setIsDetailModalVisible(true);
    };

    const showEditModal = async (record) => {
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
    ]

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            align: "center",
        },
        {
            title: "Mã",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Tên mã",
            dataIndex: "title",
            key: "title",
            align: "center",
        },
        {
            title: "Loại phiếu giảm giá",
            dataIndex: "discount_type",
            key: "discount_type",
            align: "center",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
        },
        {
            title: "Giá trị giảm",
            dataIndex: "discount_value",
            key: "discount_value",
            align: "center",
        },
        {
            title: "Đơn hàng áp dụng (VNĐ)",
            dataIndex: "discount_value",
            key: "discount_value",
            align: "center",
        },
        {
            title: "Ngày áp dụng",
            dataIndex: "discount_value",
            key: "discount_value",
            align: "center",
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            align: "center",
            render: (isActive) => (
                <span className={isActive === 1 ? 'action-link-blue' : 'action-link-red'}>
                    {isActive === 1 ? 'Đang áp dụng' : 'Dừng áp dụng'}
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
                Quản lý mã giảm giá
            </h1>

            <div className="group1">
                <Select
                    placeholder="Chức năng"
                    className="select-item"
                    
                >
                    <Select.Option value="customer">Khách hàng</Select.Option>
                    <Select.Option value="manager">Nhân viên</Select.Option>
                    <Select.Option value="admin">Quản trị viên</Select.Option>
                </Select>
            </div>

                <Table
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />

            {/* Modal Chi Tiết */}
            <Modal
                title="Chi tiết mã giảm giá"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
                width={800}
            >
                <Table
                    columns={detailColumn}
                    pagination={false} // Không cần phân trang vì chỉ có một bản ghi
                />
            </Modal>

            {/* Modal Cập Nhật */}
            <Modal
                title="Cập nhật mã giảm giá"
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
                        <Button key="submit" type="primary" >Cập nhật</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Coupon;
