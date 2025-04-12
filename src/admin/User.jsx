import { ArrowRightOutlined, BookOutlined, EyeOutlined, ProductOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Modal, Skeleton, Table, Tooltip, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthServices } from '../services/auth';
import { OrderService } from '../services/order';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';

const User = () => {
    const { id } = useParams();
    const [returns, setReturns] = useState([]);
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [isModal, setIsModal] = useState(false);
    const hideReturn = () => setIsModal(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [productData, setProductData] = useState([])
    const [pointHistory, setPointHistory] = useState([]);
    const [orderInfo, setOrderInfo] = useState({
        email: "",
        address: "",
        fullname: "",
        shipping_fee: "",
        discount_points: "",
        total_amount: "",
        coupon_discount_value: "",
        coupon_discount_type: "",
    });

    // thông tin khách hàng
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await AuthServices.getAUser(id);
                setUserData(data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [id]); // Chỉ gọi lại khi id thay đổi

    // đơn hàng của khách
    useEffect(() => {
        if (userData) {
            const fetchOrders = async () => {
                try {
                    const response = await OrderService.getOrderByIdUser(id);
                    setOrders(response.orders);
                    setOrderCount(response.orders.length);
                    setIsLoading(false);
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
                    setIsLoading(false);
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể tải danh sách đơn hàng.",
                    });

                }
            };

            fetchOrders();
        }
    }, [id, userData]); // Chỉ gọi lại khi id hoặc userData thay đổi

    // sản phẩm đã mua
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await OrderService.productByUserId(id);
                setProductData(data.top_products);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm của người dùng:", error);
                setIsLoading(false);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải sản phẩm của người dùng.",
                });
            }
        };

        if (id) {
            fetchProducts();  // Chỉ gọi service nếu có id
        }
    }, [id]);  // Chỉ gọi lại khi id thay đổi


    const showModal = async (order) => {
        setIsModalVisible(true);
        setSelectedOrderId(order.id);

        setOrderInfo({
            discount_points: order.discount_points,
            shipping_fee: order.shipping_fee,
            total_amount: order.total_amount,
            coupon_discount_value: order.coupon_discount_value,
            coupon_discount_type: order.coupon_discount_type,
        });

        // Lọc danh sách sản phẩm của đơn hàng từ ordersData
        const orderDetails = await OrderService.getOrderById(order.id);
        setOrderDetails(orderDetails);
    };

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data;
        },
    });

    // đơn hoàn trả
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await OrderService.getOrderReturnByIdUser(id);
                if (response?.order_returns && Array.isArray(response.order_returns)) {
                    setReturns(response.order_returns);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng hoàn trả:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchReturnDetails = async (orderId) => {
        try {
            const response = await OrderService.getReturn(orderId); // Gọi service getRefund với order_id
            setRefundDetails(response?.refund_details?.[0]);  // Lấy chi tiết hoàn trả đầu tiên (nếu có)
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
        }
    };

    const showReturn = (item) => {
        setIsModal(true);
        setSelectedProducts(item.raw.products || []);
        fetchReturnDetails(item.raw.order_id);
    };

    // lịch sử điểm
    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const data = await AuthServices.getPointByUser(id);
                setPointHistory(data); // mảng lịch sử điểm
                setIsLoading(false);
            } catch (err) {
                console.error("Lỗi khi lấy lịch sử điểm:", err);
                setIsLoading(false);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải lịch sử điểm của người dùng.",
                });
            }
        };

        if (id) fetchPoints();
    }, [id]);

    const getPointDataSource = (history) =>
        history.map((item, index) => ({
            key: item.id,
            index: index + 1,
            order_code: item.order?.code,
            points: item.points,
            type: item.type,
            reason: item.reason,
            date: dayjs(item.created_at).format('DD/MM/YYYY HH:mm'),
        }));

    if (!userData) return null;

    const returnSource = returns.map((item, index) => ({
        key: item.order_id, // quan trọng cho Table
        index: index + 1,
        code: item.order.code,
        fullname: item.order.fullname,
        phone_number: item.order.phone_number,
        total_amount: item.order.total_amount,
        created_at: item.order.created_at,
        payment: { id: item.order.payment_id, name: item.order.payment_id === 1 ? "COD" : "VNPAY" },
        status_id: item.order.status_id,
        reason: item.reason,
        employee_evidence: item.employee_evidence,
        refund_proof: item.refund_proof,
        raw: item
    }));

    const getReturnReason = (note) => {
        switch (note) {
            case "store_error":
                return "Cửa hàng gửi sai, thiếu sản phẩm";
            case "damaged":
                return "Sản phẩm có dấu hiệu hư hỏng";
            case "misdescription":
                return "Sản phẩm khác với mô tả";
            case "size_change":
                return "Tôi muốn đổi size";
            case "other":
                return "Khác";
            default:
                return note || "";
        }
    };

    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const dataSource = [
        {
            key: 'phone_number',
            label: 'Số điện thoại',
            value: userData.phone_number,
        },
        {
            key: 'email',
            label: 'Email',
            value: userData.email,
        },
        {
            key: 'gender',
            label: 'Giới tính',
            value: userData.gender === 'male' ? 'Nam' : userData.gender === 'female' ? 'Nữ' : 'Khác',
        },
        {
            key: 'birthday',
            label: 'Ngày sinh',
            value: dayjs(userData.birthday).format("DD/MM/YYYY")
        },
        {
            key: 'created_at',
            label: 'Ngày đăng ký',
            value: <div className="action-link-blue">{dayjs(userData.created_at).format("DD/MM/YYYY")}</div>
        },
        {
            key: 'order_count',
            label: 'Số đơn hàng',
            value: <div className="action-link-blue">{orderCount}</div>,
        },
        {
            key: 'total_spent',
            label: 'Chi tiêu (VNĐ)',
            value: formatPrice(userData.total_spent)
        },
        {
            key: 'rank',
            label: 'Hạng khách hàng',
            value: userData.rank,
        },
        {
            key: 'loyalty_points',
            label: 'Điểm tiêu dùng',
            value: <div className="action-link-blue">{formatPrice(userData.loyalty_points)}</div>
        },
    ];

    const columns = [
        {
            title: 'Thông tin',
            dataIndex: 'label',
            key: 'label',
            width: 200,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'value',
            key: 'value',
            width: 200,
        },
    ];

    const detailColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
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
            width: 130,
            render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
        },
        {
            title: "Ngày đặt hàng",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) =>
                created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: "payment",
            align: "center",
            width: 130,
            render: (payment) => <div className="action-link-blue">{payment?.name}</div>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            render: (status) => (
                <div className={[8, 9, 11].includes(status?.id) ? "action-link-red" : "action-link-blue"}>
                    {status?.name}
                </div>
            ),
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            onClick={() => showModal(item)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const orderColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            align: "center",
            render: (text, record) => {
                // Kiểm tra nếu product có dữ liệu và lấy tên sản phẩm từ record.product.name
                const productName = record.name ? record.name : '';
                // Kiểm tra nếu variants có thuộc tính và kết hợp tên sản phẩm với thuộc tính biến thể
                const variantAttributes = record.variants.map(variant => {
                    // Lấy các thuộc tính của biến thể và nối chúng lại
                    const attributes = variant.attributes.map(attr => attr.attribute_name).join(" - ");
                    return `${productName} - ${attributes}`;  // Kết hợp tên sản phẩm với thuộc tính biến thể
                }).join(", ");

                return variantAttributes || productName;  // Nếu không có biến thể, chỉ trả về tên sản phẩm
            }
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

    const productColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "product",
            key: "product",
            align: "center",
            render: (text, record) => {
                const productName = record.name;
                const productImage = record.variant && record.variant.variant_thumbnail ? record.variant.variant_thumbnail : record.thumbnail;

                // Nếu có biến thể, kết hợp tên sản phẩm và các thuộc tính của biến thể
                const productAttributes = record.variant && record.variant.attributes
                    ? ` - ${record.variant.attributes.map(attr => attr.attribute_name).join(" - ")}`
                    : "";

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image src={productImage} alt="product" width={50} />
                        <Link to={`/admin/detailad/${record.product_id}`}><span>{productName}{productAttributes}</span></Link>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            sorter: (a, b) => b.quantity - a.quantity,
        },
    ];

    const returnColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Lý do trả hàng",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason),
        },
        {
            title: "Shop xác nhận hoàn tiền",
            dataIndex: "refund_proof",
            key: "refund_proof",
            align: "center",
            render: (_, item) => {
                return item.refund_proof ? (
                    <Image width={60} src={item.refund_proof} />
                ) : null;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            render: (_, record) => {
                const statusName = statusData?.find(s => s.id === record.status_id)?.name || "";
                const statusColorClass = [8, 9, 11].includes(record.status_id) ? "action-link-red" : "action-link-blue";

                return <div className={statusColorClass}>{statusName}</div>;
            },
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            onClick={() => showReturn(item)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const detailReturn = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "name",
            align: "center",
            render: (text, record) => {
                const productName = record.name;
                const attributes = record.attributes
                    ? record.attributes.map(attr => attr.attribute_name).join(" - ")
                    : "";

                const thumbnail = record.thumbnail;  // Lấy ảnh sản phẩm

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image width={60} src={thumbnail} />
                        <Link to={`/product-detail/${record.id}`}>
                            <span>{`${productName} ${attributes ? `- ${attributes}` : ""}`}</span>
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
            title: "Giá hoàn (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
        {
            title: "Thành tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatPrice(record.quantity * record.price),
        },
    ];

    const getPointColumns = [
        {
            title: 'STT',
            dataIndex: 'index',
            align: "center",
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            align: "center",
        },
        {
            title: 'Điểm',
            dataIndex: 'points',
            align: 'center',
            render: (value) => (
                <span style={{ color: value > 0 ? 'green' : 'red' }}>
                    {value > 0 ? `+${formatPrice(value)}` : formatPrice(value)}
                </span>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'reason',
            align: "center",
        },
        {
            title: 'Thời gian',
            dataIndex: 'date',
            align: "center",
            sorter: (a, b) => dayjs(a.date, 'DD/MM/YYYY HH:mm').unix() - dayjs(b.date, 'DD/MM/YYYY HH:mm').unix(),
        }

    ];

    return (
        <div>
            <h1 className="mb-5">
                <Avatar src={userData.avatar} size={80} style={{ marginRight: 10 }} />
                {userData.fullname}
            </h1>

            <div className="group1">
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="key"
                />

                <div className='card-info'>
                    <Skeleton active loading={isLoading}>
                        <h4 className='profile-name' >
                            <BookOutlined style={{ marginRight: "8px" }} />
                            Lịch sử mua sắm
                        </h4>
                        <Table
                            columns={detailColumns}
                            style={{ width: '100%' }}
                            pagination={{ pageSize: 5 }}
                            dataSource={orders}
                            bordered
                        />
                    </Skeleton>

                    <Skeleton active loading={isLoading}>
                        <h4 className='profile-name' >
                            <BookOutlined style={{ marginRight: "8px" }} />
                            Đơn hoàn trả
                        </h4>
                        <Table
                            columns={returnColumns}
                            dataSource={returnSource.length > 0 ? returnSource : []}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />
                    </Skeleton>
                </div>
            </div>

            <div className="group1">
                <div className='card-info'>
                    <Skeleton active loading={isLoading}>
                        <h4 className='profile-name'>
                            <ProductOutlined style={{ marginRight: "8px" }} />
                            Điểm tiêu dùng
                        </h4>
                        <Table
                            dataSource={getPointDataSource(pointHistory)}
                            columns={getPointColumns}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />
                    </Skeleton>
                </div>

                <div className='card-info'>
                    <Skeleton active loading={isLoading}>
                        <h4 className='profile-name'>
                            <ProductOutlined style={{ marginRight: "8px" }} />
                            Sản phẩm đã mua
                        </h4>
                        <Table
                            columns={productColumns}
                            dataSource={productData}
                            style={{ width: '100%' }}
                            pagination={{ pageSize: 5 }}
                            bordered
                        />
                    </Skeleton>
                </div>
            </div>

            <Modal
                title="Chi tiết đơn hàng"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={800}
            >
                <Table
                    columns={orderColumns}
                    dataSource={orderDetails.map((item, index) => ({
                        ...item,
                        key: index,
                        index: index + 1,
                        product_name: item.product?.name,
                    }))}
                    pagination={false}
                    summary={() => {
                        const totalAmount = orderDetails.reduce(
                            (sum, item) => sum + item.quantity * item.sell_price,
                            0
                        );

                        const isPercentDiscount = orderInfo.coupon_discount_type === "percent";
                        const discountValue = isPercentDiscount
                            ? (totalAmount * orderInfo.coupon_discount_value) / 100 || 0
                            : 0;

                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        Tổng tiền hàng:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        {formatPrice(totalAmount)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        Phiếu giảm giá:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        {isPercentDiscount
                                            ? `${formatPrice(discountValue)} (${orderInfo.coupon_discount_value}%)`
                                            : formatPrice(orderInfo.coupon_discount_value)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        Phí vận chuyển:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        {formatPrice(orderInfo.shipping_fee)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        Giảm giá điểm tiêu dùng:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        {formatPrice(orderInfo.discount_points)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        <strong>Tổng giá trị đơn hàng:</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(orderInfo.total_amount)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        );
                    }}
                />
            </Modal>

            <Modal
                title="Chi tiết đơn hoàn trả"
                visible={isModal}
                onCancel={hideReturn}
                footer={null}
                width={800}
            >
                <div className="group1">
                    <Table
                        columns={detailReturn}
                        dataSource={selectedProducts.map((product, index) => ({
                            ...product,
                            key: index,
                            index: index + 1,
                            price: product.price,
                            id: product.product_id,
                        }))}
                        pagination={false}
                        summary={() => {
                            const totalAmount = selectedProducts.reduce(
                                (sum, item) => sum + item.quantity * item.price,
                                0
                            );
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        <strong>Số tiền hoàn trả (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(totalAmount)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default User;