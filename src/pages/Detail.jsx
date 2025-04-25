import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal, notification, Table, Skeleton, Image } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import headerBg from "../assets/images/page-header-bg.jpg";

const Detail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [detail, setDetail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getDetailOrder(id);
                setOrder(data.order);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchOrder();
    }, [id]);

    useEffect(() => {
        const fetchDetailOrder = async () => {
            try {
                const data = await OrderService.getOrderById(id);
                // Kiểm tra dữ liệu trả về có hợp lệ
                if (data && Array.isArray(data)) {
                    setDetail(data);
                    setIsLoading(false);
                } else {
                    console.error("Dữ liệu chi tiết không hợp lệ.");
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchDetailOrder();
    }, [id]);

    // hàm xác nhận đã nhận hàng
    const handleMarkAsReceived = (id) => {
        Modal.confirm({
            title: "Xác nhận đã nhận hàng",
            content: "Để hỗ trợ đổi trả hàng, hãy quay lại video khi bạn mở kiện hàng nhé!",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const payload = {
                        order_status_id: 7,
                        note: "",
                        employee_evidence: "",
                    };

                    console.log("Dữ liệu gửi đi:", payload);

                    // Gọi API để cập nhật trạng thái đơn hàng
                    const response = await OrderService.updateOrderStatus(id, payload);
                    console.log("Phản hồi từ API:", response);

                    // Kiểm tra phản hồi chính xác từ API
                    if (response && response.message === "Cập nhật trạng thái đơn hàng thành công") {
                        notification.success({
                            message: "Cảm ơn bạn đã tin tưởng Molla Shop",
                            description: "Hẹn gặp lại!",
                        });

                        // Cập nhật lại danh sách đơn hàng với trạng thái mới
                        setOrders((prevOrders) =>
                            prevOrders.map((order) =>
                                order.id === id ? { ...order, status: { id: 7, name: "Hoàn thành" } } : order
                            )
                        );
                    } else {
                        notification.error({
                            message: "Cập nhật thất bại",
                            description: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể cập nhật trạng thái đơn hàng.",
                    });
                }
            },
        });
    };

    // hãm xác nhận hủy đơn
    const handleCancelOrder = (id) => {
        Modal.confirm({
            title: "Xác nhận hủy đơn",
            content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const payload = {
                        order_status_id: 8,
                        note: "",
                        employee_evidence: "",
                    };

                    console.log("Dữ liệu gửi đi:", payload);

                    // Gọi API để cập nhật trạng thái đơn hàng
                    const response = await OrderService.updateOrderStatus(id, payload);
                    console.log("Phản hồi từ API:", response);

                    // Kiểm tra phản hồi chính xác từ API
                    if (response && response.message === "Cập nhật trạng thái đơn hàng thành công") {
                        notification.success({
                            message: "Đơn hàng đã được hủy",
                            description: "Đơn hàng của bạn đã được hủy thành công.",
                        });

                        // Cập nhật lại danh sách đơn hàng với trạng thái mới
                        setOrders((prevOrders) =>
                            prevOrders.map((order) =>
                                order.id === orderId ? { ...order, status: { id: 8, name: "Hủy đơn" } } : order
                            )
                        );
                    } else {
                        notification.error({
                            message: "Cập nhật thất bại",
                            description: "Có lỗi xảy ra khi hủy đơn hàng.",
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể hủy đơn hàng.",
                    });
                }
            },
        });
    };

    const selectedOrder = orders.find(order => order.id === selectedOrderId);
    const orderStatus = selectedOrder ? selectedOrder.status?.id : null;

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const detailColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "product",
            align: "center",
            render: (_, record) => {
                const productName = record.name || "";
                const thumbnail = record.thumbnail;
                const variantAttributes =
                    record.variants
                        ?.map((variant) => {
                            const attributes = variant.attributes
                                .map((attr) => attr.attribute_name)
                                .join(" - ");
                            return `${productName} - ${attributes}`;
                        })
                        .join(", ") || productName;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image width={60} src={thumbnail} />
                        <Link to={`/product-detail/${record.product_id}`}>
                            <span>{variantAttributes}</span>
                        </Link>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
        {
            title: "Tổng tiền (VNĐ)", // ✅ Thêm cột tổng tiền
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatPrice(record.quantity * record.sell_price),
        },
    ];

    const dataSource = order ? [
        {
            key: "code",
            label: "Mã đơn hàng",
            value: order.code
        },
        {
            key: "total_amount",
            label: "Giá trị đơn hàng (VNĐ)",
            value: formatPrice(order.total_amount)
        },
        {
            key: "created_at",
            label: "Ngày đặt hàng",
            value: dayjs(order.created_at).format("DD/MM/YYYY")
        },
        {
            key: "address",
            label: "Địa chỉ giao hàng",
            value: order.address
        },
        {
            key: "payment",
            label: "Phương thức thanh toán",
            value:
                order.payment?.name === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : order.payment?.name === "VNPAY"
                        ? "Thanh toán qua VNPay"
                        : order.payment?.name === "MOMO"
                            ? "Thanh toán qua Momo"
                            : order.payment?.name

        },
        {
            key: "status",
            label: "Trạng thái đơn hàng",
            value: <span className={order.status?.id >= 8 ? "action-link-red" : "action-link-blue"}>{order.status?.name}</span>
        },
        {
            key: "action",
            label: "",
            align: "center",
            value: (
                <div className="">
                    {order.status?.id === 5 && (
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<CheckOutlined />}
                            onClick={() => handleMarkAsReceived(id)}
                        >
                            Đã nhận hàng
                        </Button>
                    )}

                    {(order.status?.id === 1 || order.status?.id === 2 || order.status?.id === 3) && (
                        <Button
                            color="danger"
                            variant="solid"
                            icon={<CloseOutlined />}
                            onClick={() => handleCancelOrder(id)}
                        >
                            Hủy đơn
                        </Button>
                    )}
                </div>
            ),
        }
    ] : []

    const orderColumns = [
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

    return (
        <div>
            <main className="main">
                <div
                    className="page-header text-center"
                    style={{ backgroundImage: `url(${headerBg})` }}
                >
                    <div className="container">
                        <h1 className="page-title">Đơn Đặt Hàng</h1>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container">
                        <div className="group1">
                            <Skeleton active loading={isLoading}>
                                <Table
                                    columns={orderColumns}
                                    dataSource={dataSource}
                                    pagination={false}
                                />
                            </Skeleton>

                            <div className='card-info'>
                                <Skeleton active loading={isLoading}>
                                    <Table
                                        columns={detailColumns}
                                        dataSource={detail}
                                        style={{ width: '800px' }}
                                        pagination={false}
                                        summary={() => {
                                            const totalAmount = order?.order_items?.reduce(
                                                (sum, item) => sum + item.quantity * item.sell_price,
                                                0
                                            );
                                            return (
                                                <>
                                                    <Table.Summary.Row>
                                                        <Table.Summary.Cell colSpan={4} align="right">
                                                            Tổng tiền:
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell align="center">
                                                            {formatPrice(totalAmount)}
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>

                                                    <Table.Summary.Row>
                                                        <Table.Summary.Cell colSpan={4} align="right">
                                                            Phí vận chuyển:
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell align="center">
                                                            {formatPrice(order?.shipping_fee || 0)}
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>

                                                    <Table.Summary.Row>
                                                        <Table.Summary.Cell colSpan={4} align="right">
                                                            <strong>Tổng thanh toán:</strong>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell align="center">
                                                            <strong>{formatPrice(order?.total_amount || 0)}</strong>
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>
                                                </>
                                            );
                                        }}
                                    />
                                </Skeleton>

                                <hr />
                                <div style={{ marginLeft: '60px' }}>
                                    <span style={{fontSize: '16px', fontWeight:'bold'}}>Để được hỗ trợ đổi trả hay có bất kì thắc mắc nào, hãy liên hệ với Molla</span> <br />
                                    <span style={{fontSize: '14px'}}><strong>Zalo:</strong> 0987654321</span> <br />
                                    <span style={{fontSize: '14px'}}><strong>Email:</strong> hotro@mollashop.com</span><br />
                                    <span style={{fontSize: '14px'}}><strong>Hotline:</strong> 09100204</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Detail;

