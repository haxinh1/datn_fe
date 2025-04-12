import { EditOutlined, EyeOutlined, MenuOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Col, Modal, Row, Select, Skeleton, Table, Tooltip, Upload, Form, notification, Image } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { OrderService } from '../services/order'
import { useMutation, useQuery } from '@tanstack/react-query'
import TextArea from 'antd/es/input/TextArea'

const Back = () => {
    const [returns, setReturns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const hideEdit = () => setIsModal(false);
    const [form] = Form.useForm();
    const [currentStatusId, setCurrentStatusId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refundDetails, setRefundDetails] = useState(null);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const hideRefundModal = () => setIsRefundModalVisible(false);
    const [image, setImage] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [filters, setFilters] = useState({
        status: null,
    });

    useEffect(() => {
        const fetchReturns = async () => {
            setIsLoading(true);
            try {
                const response = await OrderService.getReturnOrder();
                if (response?.order_returns && Array.isArray(response.order_returns)) {
                    setReturns(response.order_returns);
                }
            } catch (error) {
                console.error("Lỗi khi lấy đơn hàng hoàn trả:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReturns();
    }, []);

    const filteredReturns = returns.filter((item) => {
        const status = item.order.status_id;
        return !filters.status || status === filters.status;
    });

    const dataSource = filteredReturns.map((item, index) => ({
        key: item.order_id,
        index: index + 1,
        code: item.order.code,
        fullname: item.order.fullname,
        phone_number: item.order.phone_number,
        total_amount: item.order.total_amount,
        created_at: item.order.created_at,
        payment: {
            id: item.order.payment_id,
            name: item.order.payment_id === 1 ? "COD" : "VNPAY",
        },
        status_id: item.order.status_id,
        reason: item.reason,
        employee_evidence: item.employee_evidence,
        refund_proof: item.refund_proof,
        bank_name: item.bank_name,
        bank_account_number: item.bank_account_number,
        bank_qr: item.bank_qr,
        raw: item,
    }));

    const fetchReturnDetails = async (orderId) => {
        try {
            const response = await OrderService.getReturn(orderId); // Gọi service getRefund với order_id
            setRefundDetails(response?.refund_details?.[0]);  // Lấy chi tiết hoàn trả đầu tiên (nếu có)
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
        }
    };

    // Khi người dùng nhấn vào chi tiết, gọi fetchRefund để lấy dữ liệu hoàn trả
    const showModal = (item) => {
        setIsModalVisible(true);
        setSelectedProducts(item.raw.products || []);
        fetchReturnDetails(item.raw.order_id);  // Gọi API với order_id
    };

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data;
        },
    });

    const validTransitions = {
        9: [10, 11],
    };

    const statusCounts = {
        9: returns.filter(item => item.order.status_id === 9).length,
        10: returns.filter(item => item.order.status_id === 10).length,
        11: returns.filter(item => item.order.status_id === 11).length,
        12: returns.filter(item => item.order.status_id === 12).length,
        13: returns.filter(item => item.order.status_id === 13).length,
        14: returns.filter(item => item.order.status_id === 14).length,
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const showEdit = (item) => {
        setIsModal(true);
        setSelectedItem(item); // Lưu item vào state
        setCurrentStatusId(item.status_id);
        form.setFieldsValue({
            status_id: undefined,
            note: "",
            employee_evidence: ""
        });
    };

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

    const { mutate: updateOrderStatus } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.updateOrderReturn(id, data);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                message: "Xác nhận thành công!",
            });

            form.resetFields();
            setIsModal(false);
        },
        onError: (error) => {
            console.error("Lỗi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
            });
        },
    });

    // ✅ Hàm cập nhật trạng thái đơn hàng
    const handleUpdateOrder = async (values) => {
        if (!selectedItem) {
            notification.error({ message: "Không tìm thấy đơn hàng để cập nhật!" });
            return;
        }

        // Lấy id người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        const payload = {
            status_id: values.status_id,
            note: values.note,
            user_id: userId,
        };

        console.log("Dữ liệu gửi đi:", payload); // Debug
        updateOrderStatus(
            { id: selectedItem.raw.order_id, data: payload }, // Sử dụng selectedItem.raw.order_id
        );
    };

    const { mutate: requestReturn } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.confirmBack(id, data);
            return response.data;
        },
        onSuccess: () => {
            notification.success({
                message: "Xác nhận hoàn tiền thành công!",
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
        const refundProof = form.getFieldValue("refund_proof");

        // Lấy user_id từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.id;

        // Tạo payload
        const payload = {
            user_id: userId,  // Lấy user_id từ localStorage
            note: note,  // Ghi chú yêu cầu hoàn tiền
            refund_proof: refundProof,  // Chứng minh hoàn tiền (ảnh QR)
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

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ refund_proof: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setImage(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ refund_proof: "" }); // Cập nhật lại giá trị trong form
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

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Khách hàng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone_number",
            key: "phone_number",
            align: "center",
        },
        {
            title: "Lý do trả hàng",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason)
        },
        {
            title: "Minh chứng",
            dataIndex: "employee_evidence",
            key: "employee_evidence",
            align: "center",
            render: (employee_evidence) => (
                <a
                    className='link-video'
                    href={employee_evidence}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Xem video
                </a>
            )
        },
        {
            title: "Thông tin hoàn tiền",
            dataIndex: "bank_name",
            key: "bank_name",
            align: "center",
            render: (_, record) => (
                <div>
                    <div>{record.bank_account_number} - {record.bank_name}</div>
                    {record.bank_qr && (
                        <div>
                            <Image width={60} src={record.bank_qr} />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Xác nhận hoàn tiền",
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
            title: "Thao tác",
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

                    {item.status_id === 9 && (
                        <Tooltip title="Xác nhận">
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<EditOutlined />}
                                onClick={() => showEdit(item)}
                            />
                        </Tooltip>
                    )}

                    {item.status_id === 10 && (
                        <Tooltip title="Hoàn tiền">
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
    ]

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
            render: (_, record) => {
                const attributes = record.attributes?.map(attr => attr.attribute_name).join(" - ");
                return `${record.name}${attributes ? ` - ${attributes}` : ''}`;
            }
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
        {
            title: "Thành tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatPrice(record.quantity * record.price),
        }
    ];

    return (
        <div>
            <h1 className="mb-5">
                <RollbackOutlined style={{ marginRight: "8px" }} />
                Đơn hàng hoàn trả
            </h1>

            <div className='group1'>
                <Tooltip title="Danh sách đơn hàng">
                    <Button
                        type={!filters.status ? "primary" : "default"}
                        onClick={() => handleFilterChange("status", null)}
                        icon={<MenuOutlined />}
                    />
                </Tooltip>

                <Button
                    type={filters.status === 9 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 9)}
                >
                    Trả hàng ({statusCounts[9]})
                </Button>
                <Button
                    type={filters.status === 10 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 10)}
                >
                    Châp nhận trả hàng ({statusCounts[10]})
                </Button>
                <Button
                    type={filters.status === 11 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 11)}
                >
                    Từ chối trả hàng ({statusCounts[11]})
                </Button>
                <Button
                    type={filters.status === 12 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 12)}
                >
                    Đã hoàn tiền ({statusCounts[12]})
                </Button>
                <Button
                    type={filters.status === 13 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 13)}
                >
                    Đang trả hàng về shop ({statusCounts[13]})
                </Button>
                <Button
                    type={filters.status === 14 ? "primary" : "default"}
                    onClick={() => handleFilterChange("status", 14)}
                >
                    Shop đã nhận hàng ({statusCounts[14]})
                </Button>
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={dataSource.length > 0 ? dataSource : []} // Kiểm tra dữ liệu
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Skeleton>

            <Modal
                title="Chi tiết đơn hoàn trả"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={600}
            >
                <div className="group1">
                    <Table
                        columns={detailColumns}
                        dataSource={selectedProducts.map((product, index) => ({
                            ...product,
                            key: index,
                            index: index + 1,
                            price: product.price,
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

            <Modal
                title="Xác nhận trả hàng"
                visible={isModal}
                onCancel={hideEdit}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdateOrder}>
                    <Row gutter={24}>
                        <Col span={12} >
                            <Form.Item
                                label="Trạng thái đơn hàng"
                                name="status_id"
                                rules={[{ required: true, message: "Vui lòng cập nhật trạng thái" }]}
                            >
                                <Select
                                    className="input-item"
                                    placeholder="Chọn trạng thái"
                                    showSearch
                                >
                                    {statusData
                                        ?.filter((status) => validTransitions[currentStatusId]?.includes(status.id))
                                        .map((status) => (
                                            <Select.Option key={status.id} value={status.id}>
                                                {status.name}
                                            </Select.Option>
                                        ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ghi chú" name="note">
                                <TextArea className="input-item" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Xác nhận hoàn tiền"
                visible={isRefundModalVisible}
                onCancel={hideRefundModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleRequestRefund}>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label="Ghi chú" name="note">
                                <TextArea className='input-item' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Minh chứng"
                                name="refund_proof"
                                rules={[{ required: true, message: "Vui lòng tải lên ảnh minh chứng" }]}
                            >
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
                        <Button color="primary" variant="solid" htmlType="submit">
                            Gửi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default Back