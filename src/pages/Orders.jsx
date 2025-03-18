import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Skeleton, Table, Tooltip, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { OrderService } from '../services/order';

const Orders = () => {
    const [orders, setOrders] = useState([]); // State to store the orders
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Fetch orders by userId
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await OrderService.getOrderByIdUser(id)
                setOrders(response.orders);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải danh sách đơn hàng.",
                });
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []); // This will run once when the component mounts

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1, // Render index to start from 1
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            key: "code",
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
            render: (created_at) =>
                created_at ? dayjs(created_at).format("DD-MM-YYYY") : "",
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: "payment",
            align: "center",
            render: (payment) => <div className="action-link-blue">{payment?.name}</div>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            render: (status) => <div className="action-link-blue">{status?.name}</div>,
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
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined />}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={orders} // Pass the orders to the table
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Skeleton>
        </div>
    );
};

export default Orders;