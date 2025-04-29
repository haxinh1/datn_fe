import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal, notification, Table, Skeleton, Image, Form, Row, Col, Select, Input, Radio, Upload } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import { CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import headerBg from "../assets/images/page-header-bg.jpg";
import axios from 'axios';

const Detail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [detail, setDetail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const hideCancel = () => setIsCancelModalVisible(false);
    const [form] = Form.useForm();
    const [banks, setBanks] = useState([]);
    const [image, setImage] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [selectedReturnReason, setSelectedReturnReason] = useState(""); // Lý do trả hàng đã chọn
    const [isCustomReason, setIsCustomReason] = useState(false);

    const fetchOrder = async () => {
        try {
            const data = await OrderService.getDetailOrder(id);
            setOrder(data.order);
            setIsLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        }
    };

    const fetchDetailOrder = async () => {
        try {
            const data = await OrderService.getOrderById(id);
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

    useEffect(() => {
        fetchOrder();
    }, [id]);

    useEffect(() => {
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

                        await fetchOrder();         // 🔁 Cập nhật lại dữ liệu đơn hàng
                        await fetchDetailOrder();

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

                        await fetchOrder();         // 🔁 Cập nhật lại dữ liệu đơn hàng
                        await fetchDetailOrder();

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

    // Hàm hiển thị modal hủy đơn
    const showCancelModal = () => {
        setIsCancelModalVisible(true);
    };

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const res = await axios.get("https://api.vietqr.io/v2/banks");
                setBanks(res.data.data);
            } catch (err) {
                console.error("Lỗi khi tải danh sách ngân hàng:", err);
            }
        };
        fetchBanks();
    }, []);

    const onHandleBank = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ bank_qr: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setImage(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ bank_qr: "" }); // Cập nhật lại giá trị trong form
        }
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

                    {(order.status?.id === 1 || order.status?.id === 2 || order.status?.id === 3) && order.payment_id === 2 && (
                        <Button
                            color="danger"
                            variant="solid"
                            icon={<CloseOutlined />}
                            onClick={() => handleCancelOrder(id)}
                        >
                            Hủy đơn
                        </Button>
                    )}

                    {(order.status?.id === 1 || order.status?.id === 2 || order.status?.id === 3) && [1, 3].includes(order.payment_id) && (
                        <Button
                            color="danger"
                            variant="solid"
                            icon={<CloseOutlined />}
                            onClick={() => showCancelModal(id)}
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
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Để được hỗ trợ đổi trả hay có bất kì thắc mắc nào, hãy liên hệ với Molla</span> <br />
                                    <span style={{ fontSize: '14px' }}><strong>Zalo:</strong> https://res.cloudinary.com/dzpr0epks/image/upload/v1744125341/gww0d2uevbgnn8whfo5d.jpg</span> <br />
                                    <span style={{ fontSize: '14px' }}><strong>Facebook:</strong> https://res.cloudinary.com/dzpr0epks/image/upload/v1744125341/gww0d2uevbgnn8whfo5d.jpg</span> <br />
                                    <span style={{ fontSize: '14px' }}><strong>Email:</strong> hotro@mollashop.com</span><br />
                                    <span style={{ fontSize: '14px' }}><strong>Hotline:</strong> 09100204</span>
                                </div>
                            </div>

                            <Modal
                                title="Hủy đơn hàng"
                                visible={isCancelModalVisible}
                                onCancel={() => {
                                    setIsCancelModalVisible(false);
                                    form.resetFields();
                                    setSelectedReturnReason("");
                                    setReturnReason("");
                                    setIsCustomReason(false);
                                    setImage("");
                                }}
                                footer={null}
                                width={600}
                            >
                                <Form
                                    layout="vertical"
                                    form={form}
                                >
                                    <Row gutter={24}>
                                        <Col span={24} className="col-item">
                                            <Form.Item
                                                label="Ngân hàng"
                                                name="bank_name"
                                                rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
                                            >
                                                <Select
                                                    className="input-item"
                                                    allowClear
                                                    showSearch
                                                    placeholder="Chọn ngân hàng"
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) =>
                                                        option?.label?.toLowerCase().includes(input.toLowerCase())
                                                    }
                                                >
                                                    {banks.map((bank) => (
                                                        <Select.Option key={bank.code} value={bank.name} label={bank.name}>
                                                            <div className="select-option-item">
                                                                <img src={bank.logo} alt={bank.name} style={{ width: '100px' }} />
                                                                <span>{bank.name}</span>
                                                            </div>
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={24}>
                                        <Col span={12} className="col-item">
                                            <Form.Item
                                                label="Số tài khoản"
                                                name="bank_account_number"
                                                rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
                                            >
                                                <Input
                                                    className="input-item"
                                                    placeholder="Nhập số tài khoản"
                                                />
                                            </Form.Item>

                                            <Form.Item label="QR ngân hàng (nếu có)" name="bank_qr">
                                                <Upload
                                                    listType="picture"
                                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                                    data={{ upload_preset: "quangOsuy" }}
                                                    onChange={onHandleBank}
                                                    maxCount={1}
                                                >
                                                    {!image && (
                                                        <Button icon={<UploadOutlined />} className="btn-item">
                                                            Tải ảnh lên
                                                        </Button>
                                                    )}
                                                </Upload>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12} className="col-item">
                                            <Form.Item
                                                label="Lý do hủy đơn"
                                                name="reason"
                                                rules={[{ required: true, message: "Vui lòng chọn lý do hủy đơn" }]}
                                            >
                                                <Radio.Group
                                                    value={selectedReturnReason}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setSelectedReturnReason(value);
                                                        if (value === "other") {
                                                            setIsCustomReason(true);
                                                        } else {
                                                            setIsCustomReason(false);
                                                            setReturnReason("");
                                                            form.setFieldsValue({ customReason: "" });
                                                        }
                                                    }}
                                                    style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                                                >
                                                    <Radio value="mistake">Tôi đặt nhầm sản phẩm</Radio>
                                                    <Radio value="better">Tôi tìm thấy ưu đãi tốt hơn</Radio>
                                                    <Radio value="size_change">Tôi muốn đổi size/màu</Radio>
                                                    <Radio value="other">Khác</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={24}>
                                        <Col span={24}>
                                            {isCustomReason && (
                                                <Form.Item
                                                    label="Nhập lý do hủy đơn"
                                                    name="customReason"
                                                    rules={[{ required: true, message: "Vui lòng nhập lý do hủy đơn" }]}
                                                >
                                                    <Input.TextArea
                                                        value={returnReason}
                                                        onChange={(e) => setReturnReason(e.target.value)}
                                                        placeholder="Nhập lý do hủy đơn tại đây..."
                                                        rows={3}
                                                    />
                                                </Form.Item>
                                            )}
                                        </Col>
                                    </Row>

                                    <div className="add">
                                        <Button
                                            color="danger"
                                            variant="solid"
                                            htmlType="submit"
                                            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                                        >
                                            Gửi yêu cầu
                                        </Button>
                                    </div>
                                </Form>
                            </Modal>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Detail;

