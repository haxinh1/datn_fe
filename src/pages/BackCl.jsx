import React, { useEffect, useState } from 'react';
import { Button, Modal, Table, Tooltip, Image, Form, Input, Upload, Row, Col, notification, Skeleton } from 'antd';
import { OrderService } from '../services/order';
import { useParams } from 'react-router-dom';
import { EditOutlined, EyeOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import TextArea from 'antd/es/input/TextArea';

const BackCl = () => {
    const { id } = useParams();
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [productData, setProductData] = useState([]);
    const hideModal = () => setIsModalVisible(false);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const hideRefundModal = () => setIsRefundModalVisible(false);
    const [form] = Form.useForm();
    const [image, setImage] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refundDetails, setRefundDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await OrderService.getOrderReturnByIdUser(id);
                const formattedData = response.order_returns.map((orderReturn) => ({
                    key: orderReturn.order_id,
                    code: orderReturn.order.code,
                    reason: orderReturn.reason,
                    status: orderReturn.order.status_id,
                    products: orderReturn.order_returns, // Lưu mảng products
                }));
                setData(formattedData);
                setSelectedOrderId(response.order_returns[0]?.order_id);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng hoàn trả:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchRefundDetails = async (orderId) => {
        try {
            const response = await OrderService.getRefund(orderId); // Gọi service getRefund với order_id
            setRefundDetails(response?.refund_details?.[0]);  // Lấy chi tiết hoàn trả đầu tiên (nếu có)
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
        }
    };

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data;
        },
    });

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

    const showModal = (item) => {
        setProductData(item.products); 
        setIsModalVisible(true);
        fetchRefundDetails(item.key);
    };

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ employee_evidence: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setImage(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ employee_evidence: "" }); // Cập nhật lại giá trị trong form
        }
    };

    const { mutate: requestReturn } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.requestBack(id, data);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                message: "Gửi yêu cầu thành công!",
                description: "Vui lòng đợi đến khi cửa hàng hoàn lại tiền!"
            });

            form.resetFields();
            setIsRefundModalVisible(false);
        },
        onError: (error) => {
            console.error("Lỗi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
            });
        },
    });

    // ✅ Hàm cập nhật trạng thái đơn hàng
    const handleRequestRefund = async (values) => {

        const note = form.getFieldValue("note");
        const employeeEvidence = form.getFieldValue("employee_evidence");

        // Lấy user_id từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        // Tạo payload
        const payload = {
            user_id: userId,  // Lấy user_id từ localStorage
            note: note,  // Ghi chú yêu cầu hoàn tiền
            employee_evidence: employeeEvidence,  // Chứng minh hoàn tiền (ảnh QR)
        };

        console.log("Dữ liệu gửi đi:", payload); // Kiểm tra dữ liệu gửi đi

        requestReturn(
            { id: selectedOrderId, data: payload },
            {
                onSuccess: () => {
                    hideRefundModal(); // Đóng modal sau khi cập nhật
                    form.resetFields(); // Reset form về trạng thái ban đầu
                    setSelectedOrderId(null); // Xóa ID đã chọn
                },
            }
        );
    };

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

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
            title: "Lý do trả hàng",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            render: (_, record) => {
                const statusName = statusData?.find(s => s.id === record.status)?.name;
                const statusColorClass = record.status >= 8 ? "action-link-red" : "action-link-blue";
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
                            onClick={() => showModal(item)}
                        />
                    </Tooltip>

                    {item.status === 10 && (
                        <Tooltip title="Yêu cầu hoàn tiền">
                            <Button
                                color="danger"
                                variant="solid"
                                icon={<RollbackOutlined />}
                                onClick={() => {
                                    setSelectedOrderId(item.key);
                                    setIsRefundModalVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    const returnColumns = [
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

    const returndata = [
        {
            key: 'note',
            label: 'Ghi chú',
            value: refundDetails?.note || "",
        },
        {
            key: 'employee_evidence',
            label: 'Xác nhận',
            value: refundDetails?.employee_evidence ?
                <Image width={100} src={refundDetails.employee_evidence} alt="Xác nhận" /> :
                "",
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Image width={60} src={thumbnail} />
                        <span>{`${productName} ${attributes ? `- ${attributes}` : ""}`}</span>
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
            title: "Thành tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (text, record) => formatPrice(record.quantity * record.sell_price),
        },
    ];

    return (
        <div>
            <h1 className="mb-5" style={{ color: '#e48948' }}>
                <RollbackOutlined style={{ marginRight: "8px" }} />
                Đơn hàng hoàn trả
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 5 }}
                />
            </Skeleton>

            <Modal
                title="Sản phẩm hoàn trả"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={1000}
            >
                <div className="group1">
                    <Table
                        columns={returnColumns}
                        dataSource={returndata}
                        pagination={false}
                        rowKey="key"
                    />

                    <Table
                        columns={detailColumns}
                        dataSource={productData.map((item, index) => ({
                            key: index,
                            name: item.product.name,
                            quantity: item.product.quantity,
                            sell_price: parseFloat(item.product.sell_price),
                            thumbnail: item.product.thumbnail,
                            attributes: item.product.attributes,
                            total: parseFloat(item.product.sell_price) * item.product.quantity,
                        }))}
                        pagination={false}
                        summary={(pageData) => {
                            const totalPrice = pageData.reduce((sum, record) => sum + record.total, 0);
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                                        <strong>Số tiền hoàn trả (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4} align="center">
                                        <strong>{formatPrice(totalPrice)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </div>
            </Modal>

            <Modal
                title="Yêu cầu hoàn tiền"
                visible={isRefundModalVisible}
                onCancel={hideRefundModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleRequestRefund}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Thông tin tài khoản"
                                name="note"
                                rules={[{ required: true, message: "Vui lòng nhập thông tin ngân hàng" }]}
                            >
                                <TextArea className='input-item' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ảnh QR ngân hàng" name="employee_evidence">
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{ upload_preset: "quangOsuy" }}
                                    onChange={onHandleChange}
                                >
                                    {!image && (
                                        <button className="upload-button" type="button">
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                        </button>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button color="danger" variant="solid" htmlType="submit">
                            Gửi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default BackCl;
