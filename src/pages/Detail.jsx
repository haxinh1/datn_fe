import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal, notification, Table, Skeleton, Image, Form, Row, Col, Select, Input, Radio, Upload, Tooltip } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import { CheckOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import headerBg from "../assets/images/page-header-bg.jpg";
import axios from 'axios';

const Detail = () => {
    const { code } = useParams();
    const [order, setOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [detail, setDetail] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hideModal = () => setIsModalOpen(false);
    const [form] = Form.useForm();
    const [banks, setBanks] = useState([]);
    const [image, setImage] = useState("");
    const [cancelData, setCancelData] = useState(null);

    const fetchOrder = async () => {
        try {
            const data = await OrderService.getCodeOrder(code);
            setOrder(data.order);
            setIsLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
        }
    };

    const fetchDetailOrder = async () => {
        try {
            if (!order?.id) return;
            const data = await OrderService.getOrderById(order.id);
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
    }, [code]);

    useEffect(() => {
        if (order) {
            fetchDetailOrder();
        }
    }, [order]);

    const fetchCancelData = async () => {
        try {
            if (!order?.id) return;
            const response = await OrderService.getACancel(order.id);
            setCancelData(response.order_cancel);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hủy:", error);
            setCancelData(null);
        }
    };

    // Gọi fetchCancelData khi order thay đổi
    useEffect(() => {
        if (order) {
            fetchCancelData();
        }
    }, [order]);

    const handleMarkAsReceived = () => {
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

                    const response = await OrderService.updateOrderStatus(order.id, payload);
                    console.log("Phản hồi từ API:", response);

                    if (response && response.message === "Cập nhật trạng thái đơn hàng thành công") {
                        notification.success({
                            message: "Cảm ơn bạn đã tin tưởng Molla Shop",
                            description: "Hẹn gặp lại!",
                        });

                        await fetchOrder();
                        await fetchDetailOrder();

                        setOrders((prevOrders) =>
                            prevOrders.map((item) =>
                                item.id === order.id ? { ...item, status: { id: 7, name: "Hoàn thành" } } : item
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

    const handleSubmitBankInfo = async (values) => {
        try {
            await OrderService.infoBack(cancelData.id, values); // Dùng order_cancels.id

            notification.success({
                message: "Thành công",
                description: "Thông tin hoàn tiền đã được gửi.",
            });

            hideModal();
            form.resetFields();
            setImage("");
        } catch (error) {
            console.error("Lỗi khi gửi thông tin ngân hàng:", error);
            notification.error({
                message: "Lỗi",
                description: "Gửi thông tin thất bại. Vui lòng thử lại.",
            });
        }
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
            form.setFieldsValue({ bank_qr: imageUrl });
        } else if (info.file.status === "removed") {
            setImage("");
            form.setFieldsValue({ bank_qr: "" });
        }
    };

    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const getReturnReason = (note) => {
        switch (note) {
            case "mistake":
                return "Đặt nhầm sản phẩm";
            case "better":
                return "Tìm thấy ưu đãi tốt hơn";
            case "size_change":
                return "Đổi size/màu";
            case "error":
                return "Sản phẩm bị hư, hỏng khi vận chuyển";
            case "disconnect":
                return "Không thể liên hệ với người đặt";
            case "other":
                return "Khác";
            default:
                return note || "";
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
            title: "Tổng tiền (VNĐ)",
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
                            onClick={() => handleMarkAsReceived()}
                        >
                            Đã nhận hàng
                        </Button>
                    )}
                </div>
            ),
        }
    ] : [];

    const cancelDataSource = cancelData
        ? [
            {
                key: "created_at",
                label: "Ngày hủy",
                value: cancelData.created_at ? dayjs(cancelData.created_at).format("DD/MM/YYYY") : "",
            },
            {
                key: "reason",
                label: "Lý do hủy đơn",
                value: getReturnReason(cancelData.reason),
            },
            {
                key: "refund_proof",
                label: "Xác nhận hoàn tiền",
                value: cancelData.refund_proof ? (
                    <Image width={60} src={cancelData.refund_proof} />
                ) : "",
            },
            {
                key: "action",
                label: "",
                value: (
                    <div className="">
                        {(order.status?.id === 8 && !cancelData.bank_account_number && !cancelData.bank_name) && (
                            <Button
                                color="danger"
                                variant="solid"
                                icon={<RollbackOutlined />}
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                            >
                                Yêu cầu hoàn tiền
                            </Button>
                        )}
                    </div>
                ),
            },
        ]
        : [];

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
                            <div className='card-info'>
                                <Skeleton active loading={isLoading}>
                                    <Table
                                        columns={orderColumns}
                                        dataSource={dataSource}
                                        pagination={false}
                                    />

                                    {order?.status?.id >= 8 && (
                                        <Table
                                            columns={orderColumns}
                                            dataSource={cancelDataSource}
                                            pagination={false}
                                            showHeader={false}
                                        />
                                    )}
                                </Skeleton>
                            </div>

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
                                title="Gửi thông tin hoàn tiền"
                                open={isModalOpen}
                                onCancel={hideModal}
                                footer={null}
                                width={600}
                            >
                                <Form
                                    layout="vertical"
                                    form={form}
                                    onFinish={handleSubmitBankInfo}
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
                                        </Col>

                                        <Col span={12} className="col-item">
                                            <Form.Item label="QR ngân hàng (nếu có)" name="bank_qr">
                                                <Upload
                                                    listType="picture"
                                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                                    data={{ upload_preset: "quangOsuy" }}
                                                    onChange={onHandleBank}
                                                >
                                                    {!image && (
                                                        <Button icon={<UploadOutlined />} className="btn-item">
                                                            Tải ảnh lên
                                                        </Button>
                                                    )}
                                                </Upload>
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <div className="add">
                                        <Button color="danger" variant="solid" htmlType="submit">
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