import { BookOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Modal, Select, Skeleton, Table, Tooltip } from 'antd';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderService } from './../services/order';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const Order = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => {
            const response = await OrderService.getAllOrder();
            console.log("API Response:", response); // Kiểm tra dữ liệu
            return response.orders || { data: [] }; // Đảm bảo orders không bị undefined
        },
    });

    const orders = ordersData || { data: [] };

    // Chuyển đổi dữ liệu thành dataSource cho bảng
    const dataSource = orders.data.map((order, index) => ({
        ...order,
        key: order.id,
        index: index + 1, // STT (số thứ tự)
    }));

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const showModal = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Tên người đặt",
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
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "total_amount",
            key: "total_amount",
            align: "center",
            render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
        },
        {
            title: "Ngày đặt hàng",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) => (created_at ? dayjs(created_at).format("DD-MM-YYYY") : ""),
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            align: 'center', 
            render: (status) => <div className='action-link-blue'>{status?.name}</div> 
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Tooltip title="Xem thêm">
                        <Button 
                            color="purple" 
                            variant="solid" 
                            icon={<EyeOutlined />} 
                            onClick={() => showModal(item)}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Link to={`/admin/edit_order/${item.id}`}>
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<EditOutlined/>}
                            />
                        </Link>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <BookOutlined style={{ marginRight: "8px" }} />
                Quản lý đơn hàng
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Skeleton>  

            <Modal 
                title="Chi tiết đơn hàng" 
                visible={isModalVisible} 
                onCancel={handleCancel} 
                footer={null}
            >
                
            </Modal>  
        </div>
    );
};

export default Order;
