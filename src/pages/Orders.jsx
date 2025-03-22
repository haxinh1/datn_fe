import { BookOutlined, CheckOutlined, CloseOutlined, EyeOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Col, ConfigProvider, DatePicker, Form, Input, Modal, Radio, Row, Select, Skeleton, Table, Tooltip, Upload, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { OrderService } from '../services/order';
import { paymentServices } from '../services/payments';
import { useQuery } from '@tanstack/react-query';
import viVN from "antd/es/locale/vi_VN";

const Orders = () => {
    const [orders, setOrders] = useState([]); // State to store the orders
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const { RangePicker } = DatePicker;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderInfo, setOrderInfo] = useState({ email: "", address: "" });
    const [isReturnFormVisible, setIsReturnFormVisible] = useState(false); // State để hiển thị form lý do trả hàng
    const [returnReason, setReturnReason] = useState(""); // Lý do trả hàng
    const [selectedReturnReason, setSelectedReturnReason] = useState(""); // Lý do trả hàng đã chọn
    const [isCustomReason, setIsCustomReason] = useState(false);
    const [video, setVideo] = useState("");
    const [form] = Form.useForm();

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const showModal = async (order) => {
        setIsModalVisible(true);
        setSelectedOrderId(order.id);

        // Cập nhật email và địa chỉ của đơn hàng
        setOrderInfo({
            email: order.email,
            address: order.address,
        });

        // Lọc danh sách sản phẩm của đơn hàng từ ordersData
        const orderDetails = await OrderService.getOrderById(order.id);
        setOrderDetails(orderDetails);
    };

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
    }, []);

    const [filters, setFilters] = useState({
        dateRange: null,
        status: null,
        payment: null,
    });

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredOrders = orders.filter((order) => {
        const { dateRange, status, payment } = filters;
        const orderDate = dayjs(order.created_at);
        const isDateValid =
            !dateRange ||
            (orderDate.isSameOrAfter(dateRange[0], "day") &&
                orderDate.isSameOrBefore(dateRange[1], "day"));
        const isStatusValid = !status || order.status?.id === status;
        const isPaymentValid = !payment || order.payment?.id === payment;
        return isDateValid && isStatusValid && isPaymentValid;
    });

    // danh sách phương thức thanh toán
    const { data: payments } = useQuery({
        queryKey: ["payments"],
        queryFn: paymentServices.getPayment,
    });

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data;
        },
    });
    const status = statusData ? [...statusData].sort((a, b) => a.id - b.id) : [];

    // hàm xác nhận đã nhận hàng
    const handleMarkAsReceived = (orderId) => {
        Modal.confirm({
            title: "Xác nhận đã nhận hàng",
            content: "Để hỗ trợ đổi trả hàng, hãy quay lại video khi bạn mở kiện hàng nhé!",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const payload = {
                        order_status_id: 7,  // Status 'Hoàn thành'
                        note: "",
                        employee_evidence: "",
                    };

                    console.log("Dữ liệu gửi đi:", payload);

                    // Gọi API để cập nhật trạng thái đơn hàng
                    const response = await OrderService.updateOrderStatus(orderId, payload);
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
                                order.id === orderId ? { ...order, status: { id: 7, name: "Hoàn thành" } } : order
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
    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: "Xác nhận hủy đơn",
            content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const payload = {
                        order_status_id: 8,  // Status 'Hủy đơn'
                        note: "",  // Nếu có ghi chú, bạn có thể thêm ở đây
                        employee_evidence: "",  // Cung cấp chứng cứ nếu cần thiết
                    };

                    console.log("Dữ liệu gửi đi:", payload);

                    // Gọi API để cập nhật trạng thái đơn hàng
                    const response = await OrderService.updateOrderStatus(orderId, payload);
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

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setVideo(imageUrl);
            form.setFieldsValue({ employee_evidence: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setVideo(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ employee_evidence: "" }); // Cập nhật lại giá trị trong form
        }
    };

    const handleReturnOrder = async () => {
        const payload = {
            order_status_id: 9,  // Status 'Chờ xử lý trả hàng'
            note: returnReason || selectedReturnReason,  // Gửi lý do trả hàng từ radio hoặc input
            employee_evidence: video,  // Gửi video minh chứng
        };
    
        console.log("Dữ liệu gửi đi:", payload);
    
        try {
            // Gọi API để cập nhật trạng thái đơn hàng
            const response = await OrderService.updateOrderStatus(selectedOrderId, payload);
            console.log("Phản hồi từ API:", response);
    
            // Kiểm tra phản hồi chính xác từ API
            if (response && response.message === "Cập nhật trạng thái đơn hàng thành công") {
                notification.success({
                    message: "Yêu cầu trả hàng đã được gửi thành công",
                    description: "Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất.",
                });
    
                // Cập nhật lại danh sách đơn hàng với trạng thái mới
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === selectedOrderId ? { ...order, status: { id: 9, name: "Chờ xử lý trả hàng" } } : order
                    )
                );
    
                // Ẩn form trả hàng sau khi gửi yêu cầu
                setIsReturnFormVisible(false);
            } else {
                notification.error({
                    message: "Cập nhật thất bại",
                    description: "Có lỗi xảy ra khi gửi yêu cầu trả hàng.",
                });
            }
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu trả hàng:", error);
            notification.error({
                message: "Lỗi",
                description: "Không thể gửi yêu cầu trả hàng.",
            });
        }
    };    

    const detailColumns = [
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

    const columns = [
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
            render: (payment) => {
                const paymentName = payment?.name === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : payment?.name === "VNPAY"
                        ? "Thanh toán trực tuyến"
                        : payment?.name;
                return <span>{paymentName}</span>;
            },
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
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, item) => {
                const { status } = item;
                const isDelivered = status?.id === 5; // 'Đã giao hàng' status
                const isCompleted = status?.id === 7; // 'Hoàn thành' status
                const canCancel = [1, 2, 3].includes(status?.id);
                return (
                    <div className="group1">
                        <Tooltip title="Chi tiết đơn hàng">
                            <Button
                                color="purple"
                                variant="solid"
                                icon={<EyeOutlined />}
                                onClick={() => showModal(item)}
                            />
                        </Tooltip>

                        <Tooltip title="Đã nhận hàng">
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<CheckOutlined />}
                                disabled={!isDelivered} // chỉ được bấm khi ở trạng thái 5
                                onClick={() => handleMarkAsReceived(item.id)}
                            />
                        </Tooltip>
                    </div>
                );
            },
        }
    ];

    return (
        <div>
            <h1 className="mb-5">
                <BookOutlined style={{ marginRight: "8px" }} />
                Đơn hàng của bạn
            </h1>

            <div className="group1">
                <ConfigProvider locale={viVN}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        onChange={(dates) => handleFilterChange("dateRange", dates)}
                        allowClear
                    />
                </ConfigProvider>

                <Select
                    placeholder="Trạng thái"
                    className="select-item"
                    onChange={(value) => handleFilterChange("status", value)}
                    allowClear
                >
                    {status.map((item) => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.name}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    placeholder="Phương thức thanh toán"
                    className="select-item"
                    onChange={(value) => handleFilterChange("payment", value)}
                    allowClear
                >
                    {payments?.map((method) => (
                        <Select.Option key={method.id} value={method.id}>
                            {method.name === "COD"
                                ? "Thanh toán khi nhận hàng"
                                : method.name === "VNPAY"
                                    ? "Thanh toán trực tuyến"
                                    : method.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    pagination={{ pageSize: 5 }}
                />
            </Skeleton>

            <Modal
                title="Chi tiết đơn hàng"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={1000}
            >
                <span>Email người đặt: <span className="text-quest">{orderInfo.email}</span></span> <br />
                <span>Địa chỉ nhận hàng: <span className="text-quest">{orderInfo.address}</span></span>

                <Table
                    columns={detailColumns}
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
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={4} align="right">
                                    <strong>Tổng giá trị (VNĐ):</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align="center">
                                    <strong>{formatPrice(totalAmount)}</strong>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />

                <div className="add">
                    <Button
                        color="danger"
                        variant="solid"
                        style={{ marginRight: '10px' }}
                        // Chỉ bật nút khi trạng thái đơn hàng là 5 (Đã giao hàng) hoặc 7 (Hoàn thành)
                        disabled={!(orderStatus === 5 || orderStatus === 7)}
                        onClick={() => setIsReturnFormVisible(true)}
                    >
                        Trả hàng
                    </Button>

                    {/* Nút Hủy đơn */}
                    <Button
                        color="danger"
                        variant="solid"
                        // Chỉ bật nút khi trạng thái đơn hàng là 1, 2, hoặc 3
                        disabled={!(orderStatus === 1 || orderStatus === 2 || orderStatus === 3)}
                        onClick={() => handleCancelOrder(selectedOrderId)}
                    >
                        Hủy đơn
                    </Button>
                </div>

                {isReturnFormVisible && (
                    <Form 
                        layout="vertical"  
                        onFinish={handleReturnOrder}
                        style={{ marginTop: "20px" }}
                    >
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item 
                                    label="Lý do trả hàng" 
                                    name='note'
                                    rules={[{ required: true, message: "Vui lòng chọn hoặc nhập lý do trả hàng" }]}
                                >
                                    <Radio.Group
                                        value={selectedReturnReason}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSelectedReturnReason(value);
                                            if (value === "other") {
                                                setIsCustomReason(true); // Hiển thị ô nhập lý do thủ công nếu chọn "Khác"
                                            } else {
                                                setIsCustomReason(false); // Nếu chọn lý do có sẵn, ẩn ô nhập lý do thủ công
                                            }
                                        }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                                    >
                                        <Radio value="store_error">Cửa hàng gửi sai, thiếu sản phẩm</Radio>
                                        <Radio value="damaged">Sản phẩm có dấu hiệu hư hỏng</Radio>
                                        <Radio value="misdescription">Sản phẩm khác với mô tả</Radio>
                                        <Radio value="size_change">Tôi muốn đổi size</Radio>
                                        <Radio value="other">Khác</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Video minh chứng"
                                    name="employee_evidence"
                                    rules={[{ required: true, message: "Vui lòng tải lên video minh chứng" }]}
                                >
                                    <Upload
                                        listType="picture-card"
                                        action="https://api.cloudinary.com/v1_1/dzpr0epks/video/upload"
                                        data={{ upload_preset: "quangOsuy" }}
                                        onChange={onHandleChange}
                                        accept="video/*" 
                                    >
                                        {!video && (
                                            <button className="upload-button" type="button">
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Tải video lên</div>
                                            </button>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                        {/* Input lý do trả hàng nếu chọn "Khác" */}
                        {isCustomReason && (
                            <Form.Item label="Nhập lý do trả hàng">
                                <Input.TextArea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="Nhập lý do trả hàng tại đây..."
                                />
                            </Form.Item>
                        )}

                        <div className="add">
                            <Button color="danger" variant="solid" htmlType="submit">
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default Orders;