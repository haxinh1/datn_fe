import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Image, Modal, Skeleton, Table, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthServices } from '../services/auth';
import dayjs from 'dayjs';
import { OrderService } from '../services/order';

const Staff = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [staff, setStaff] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusList, setStatusList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderInfo, setOrderInfo] = useState({
        shipping_fee: "",
        discount_points: "",
        total_amount: "",
        coupon_discount_value: "",
        coupon_discount_type: "",
    });

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
    }, [id]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await AuthServices.getModifiedById(id);
                setStaff(data.data)
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            }
        };

        fetchStaff();
    }, [id]);

    useEffect(() => {
        const fetchStatusList = async () => {
            try {
                const response = await OrderService.getAllStatus();
                setStatusList(response?.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách trạng thái:", error);
            }
        };

        fetchStatusList();
    }, []);

    const showModal = async (item) => {
        setIsModalVisible(true);

        const orderId = item.order_id;
        try {
            const data = await OrderService.getOrderById(orderId);
            setOrderDetails(data);

            const detailData = await OrderService.getDetailOrder(orderId);
            setOrderInfo({
                total_amount: detailData.order.total_amount,
                discount_points: detailData.order.discount_points,
                shipping_fee: detailData.order.shipping_fee,
                coupon_discount_value: detailData.order.coupon_discount_value,
                coupon_discount_type: detailData.order.coupon_discount_type,
            });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        }
    };

    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Tạo một object map từ statusList để dễ tra cứu
    const statusMap = statusList.reduce((acc, status) => {
        acc[status.id] = status.name;
        return acc;
    }, {});

    if (!userData) return null;

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
            label: 'Ngày tham gia',
            value: <div className="action-link-blue">{dayjs(userData.created_at).format("DD/MM/YYYY")}</div>
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
        },
    ];

    const detailColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "order",
            align: "center",
            render: (order) => order?.code || "",
        },
        {
            title: "Trạng thái cập nhật",
            dataIndex: "order_status_id",
            align: "center",
            render: (order_status_id) => (
                <div className='action-link-blue'>
                    {statusMap[order_status_id] || ""}
                </div>
            ),
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            align: "center",
            width: 140,
            render: (note) => note || "",
        },
        {
            title: "Minh chứng",
            dataIndex: "employee_evidence",
            align: "center",
            render: (employee_evidence) => employee_evidence ? <Image width={60} src={employee_evidence} /> : null,
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) => (created_at ? dayjs(created_at).format("DD/MM/YYYY - HH:mm") : ""),
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết đơn hàng">
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

    return (
        <div>
            <h1 className="mb-5">
                <UserOutlined style={{ marginRight: "8px" }} />
                Nhật ký hoạt động
            </h1>

            <div className="group1">
                <div className='card-info'>
                    <div className="avatar">
                        <Avatar size={200} src={userData.avatar} />
                    </div>

                    <h1 className="mb-5 avatar">{userData.fullname}</h1>
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        pagination={false}
                        rowKey="key"
                        showHeader={false}
                    />
                </div>

                <Skeleton active loading={isLoading}>
                    <Table
                        columns={detailColumns}
                        style={{ width: '1000px' }}
                        dataSource={staff ? staff.map((item, index) => ({
                            ...item,
                            key: index,
                            index: index + 1,
                        })) : []}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />
                </Skeleton>
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
                        key: index, // Thêm key cho mỗi dòng dữ liệu
                        index: index + 1,
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
                                        <strong>{formatPrice(totalAmount)}</strong>
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
                                        Giảm giá điểm tiêu dùng:
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        {formatPrice(orderInfo.discount_points)}
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

export default Staff;