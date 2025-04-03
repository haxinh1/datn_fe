import { ArrowRightOutlined, BookOutlined, EyeOutlined, ProductOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Modal, Skeleton, Table, Tooltip, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthServices } from '../services/auth';
import { OrderService } from '../services/order';
import dayjs from 'dayjs';

const User = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [productData, setProductData] = useState([])
    const [orderInfo, setOrderInfo] = useState({ email: "", address: "", fullname: "", shipping_fee: "", discount_points: "", total_amount: "" });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await AuthServices.getAUser(id);
                setUserData(data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchUser();
    }, [id]); // Chỉ gọi lại khi id thay đổi

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
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể tải danh sách đơn hàng.",
                    });
                }
            };

            fetchOrders();
        }
    }, [id, userData]); // Chỉ gọi lại khi id hoặc userData thay đổi

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await OrderService.productByUserId(id);
                setProductData(data.top_products);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm của người dùng:", error);
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

    if (!userData) return null;

    const showModal = async (order) => {
        setIsModalVisible(true);
        setSelectedOrderId(order.id);

        setOrderInfo({
            discount_points: order.discount_points,
            shipping_fee: order.shipping_fee,
            total_amount: order.total_amount
        });

        // Lọc danh sách sản phẩm của đơn hàng từ ordersData
        const orderDetails = await OrderService.getOrderById(order.id);
        setOrderDetails(orderDetails);
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
            label: 'Điểm tích lũy',
            value: formatPrice(userData.loyalty_points)
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
                <div className={status?.id >= 8 ? "action-link-red" : "action-link-blue"}>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
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
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            key: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
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
                    bordered
                    pagination={false}
                    summary={() => {
                        const totalAmount = orderDetails.reduce(
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
        </div>
    );
};

export default User;