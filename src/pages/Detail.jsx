import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Modal, notification, Row, Table, Form, Radio, Upload, Input } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import { CheckOutlined, CloseOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const Detail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => setIsModalVisible(true);
    const hideModal = () => setIsModalVisible(false);
    const [returnReason, setReturnReason] = useState("");
    const [selectedReturnReason, setSelectedReturnReason] = useState("");
    const [isCustomReason, setIsCustomReason] = useState(false);
    const [video, setVideo] = useState("");
    const [form] = Form.useForm();
    const [detail, setDetail] = useState([]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getDetailOrder(id);
                setOrder(data.order);
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
                    setDetail(data);  // Lưu toàn bộ mảng sản phẩm vào state
                } else {
                    console.error("Dữ liệu chi tiết không hợp lệ.");
                }
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchDetailOrder();
    }, [id]);

    // Tạo lại dữ liệu bảng từ tên sản phẩm, các thuộc tính của variant, số lượng và giá bán
    const transformedDetail = detail.flatMap((item, index) =>
        item.variants.map((variant, variantIndex) => {
            // Kết hợp tên sản phẩm và các giá trị thuộc tính của variant
            const attributeNames = variant.attributes.map(attribute => attribute.attribute_name).join(" - ");
            const fullName = `${item.name} - ${attributeNames}`; // Tạo tên đầy đủ

            return {
                key: `variant-${index}-${variantIndex}`,  // Key duy nhất cho variant
                name: fullName,
                quantity: variant.quantity,
                sell_price: variant.sell_price,
            };
        })
    );

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
                        order_status_id: 7,  // Status 'Hoàn thành'
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

    // hàm trả hàng
    const handleReturnOrder = async () => {
        const payload = {
            order_status_id: 9,  // Status 'Chờ xử lý trả hàng'
            note: returnReason || selectedReturnReason,  // Gửi lý do trả hàng từ radio hoặc input
            employee_evidence: video,  // Gửi video minh chứng
        };

        console.log("Dữ liệu gửi đi:", payload);

        try {
            // Gọi API để cập nhật trạng thái đơn hàng
            const response = await OrderService.updateOrderStatus(id, payload);
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
            title: "Tên sản phẩm",
            dataIndex: "name",
            align: "center",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
            width: 60
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            width: 100,
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
        {
            title: "Tổng tiền (VNĐ)", // ✅ Thêm cột tổng tiền
            dataIndex: "total",
            align: "center",
            width: 100,
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
            key: "payment",
            label: "Phương thức thanh toán",
            value: order.payment?.name === "COD" ? "Thanh toán khi nhận hàng" : "Thanh toán trực tuyến"
        },
        {
            key: "status",
            label: "Trạng thái đơn hàng",
            value: <span className={order.status?.id >= 8 ? "action-link-red" : "action-link-blue"}>{order.status?.name}</span>
        },
        {
            key: "action",
            label: "Thao tác",
            align: "center",
            value: (
                <div className="">
                    <Button
                        color="primary"
                        variant="solid"
                        style={{ width: '140px', marginBottom: '8px' }}
                        icon={<CheckOutlined />}
                        disabled={order.status?.id !== 5}
                        onClick={() => handleMarkAsReceived(id)}
                    >
                        Đã nhận hàng
                    </Button>

                    <Button
                        color="danger"
                        variant="solid"
                        style={{ width: '140px', marginBottom: '8px' }}
                        icon={<RollbackOutlined />}
                        disabled={!(order.status?.id === 5 || order.status?.id === 7)}
                        onClick={() => showModal()}
                    >
                        Trả hàng
                    </Button>

                    <Button
                        color="danger"
                        variant="solid"
                        style={{ width: '140px' }}
                        icon={<CloseOutlined />}
                        disabled={!(order.status?.id === 1 || order.status?.id === 2 || order.status?.id === 3)}
                        onClick={() => handleCancelOrder(id)}
                    >
                        Hủy đơn
                    </Button>
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
        },
    ];

    return (
        <div>
            <main className="main">
                <div className="page-header text-center" style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}>
                    <div className="container">
                        <h1 className="page-title">Đơn Đặt Hàng</h1>
                    </div>
                </div>
                <div className="page-content">
                    <div className="container">
                        <div className="group1">
                            <Table
                                columns={orderColumns}
                                dataSource={dataSource}
                                pagination={false}
                            />

                            <Table
                                columns={detailColumns}
                                dataSource={transformedDetail}
                                bordered
                                style={{ width: '1200px' }}
                                pagination={false}
                                summary={() => {
                                    const totalAmount = order?.order_items?.reduce(
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
                        </div>

                        <Modal
                            title="Yêu cầu hoàn/trả hàng"
                            visible={isModalVisible}
                            onCancel={hideModal}
                            footer={null}
                            width={800}
                        >
                            <Form
                                layout="vertical"
                                onFinish={handleReturnOrder}
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
                                            placeholder="Nhập lý do trả hàng..."
                                        />
                                    </Form.Item>
                                )}

                                <div className="add">
                                    <Button color="danger" variant="solid" htmlType="submit">
                                        Gửi yêu cầu
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Detail;

