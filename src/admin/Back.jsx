import { CheckOutlined, EditOutlined, EyeOutlined, MenuOutlined, PlusOutlined, RollbackOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Col, Modal, Row, Select, Skeleton, Table, Tooltip, Upload, Form, notification, Image, Input, Radio, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { OrderService } from '../services/order'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import TextArea from 'antd/es/input/TextArea'

const Back = () => {
    const [returns, setReturns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const hideModal = () => setIsModalVisible(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModal, setIsModal] = useState(false);
    const hideEdit = () => setIsModal(false);
    const [isModalStock, setIsModalStock] = useState(false);
    const [selectedStockOrderId, setSelectedStockOrderId] = useState(null);
    const [form] = Form.useForm();
    const [currentStatusId, setCurrentStatusId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refundDetails, setRefundDetails] = useState(null);
    const [isRefundModalVisible, setIsRefundModalVisible] = useState(false);
    const hideRefundModal = () => setIsRefundModalVisible(false);
    const [isUpdateModal, setIsUpdateModal] = useState(false);
    const hideUpdateModal = () => setIsUpdateModal(false);
    const [image, setImage] = useState("");
    const [update, setUpdate] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [filters, setFilters] = useState({
        status: null,
    });

    const queryClient = useQueryClient();

    const { data: returnsData, isLoading: isReturnsLoading } = useQuery({
        queryKey: ['returns', searchKeyword],
        queryFn: async () => {
            if (searchKeyword.trim()) {
                const response = await OrderService.searchOrderReturn(searchKeyword);
                return response?.order_returns || response || [];
            } else {
                const response = await OrderService.getReturnOrder();
                return response?.order_returns || [];
            }
        },
    });

    useEffect(() => {
        if (returnsData) {
            const validReturns = returnsData.filter(item => item && item.order);
            setReturns(validReturns || []);
        }
        setIsLoading(isReturnsLoading);
    }, [returnsData, isReturnsLoading]);

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
    };

    const filteredReturns = returns
        .filter((item) => item && item.order)
        .filter((item) => {
            const status = item.order.status_id;
            return !filters.status || status === filters.status;
        });

    const dataSource = filteredReturns.map((item, index) => ({
        key: item.order_id,
        index: index + 1,
        code: item.order.code,
        fullname: item.order.fullname,
        phone_number: item.order.phone_number,
        total_amount: item.order.total_amount || 0,
        created_at: item.order.created_at,
        payment: {
            id: item.order.payment_id || 0,
            name: item.order.payment_id === 1 ? "COD" : "VNPAY",
        },
        status_id: item.order.status_id || 0,
        reason: item.reason,
        employee_evidence: item.employee_evidence || "",
        total_refund_amount: item.total_refund_amount || 0,
        refund_proof: item.refund_proof || "",
        bank_name: item.bank_name,
        bank_account_number: item.bank_account_number,
        bank_qr: item.bank_qr,
        order_id: item.order_id,
        products: item.products || [],
    }));

    const fetchReturnDetails = async (orderId) => {
        try {
            const response = await OrderService.getReturn(orderId);
            const refundData = response?.order_return;
            setRefundDetails(refundData);
            return refundData;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
            return null;
        }
    };

    // Khi người dùng nhấn vào chi tiết, gọi fetchRefund để lấy dữ liệu hoàn trả
    const showModal = async (item) => {
        setIsModalVisible(true);
        try {
            const refundData = await fetchReturnDetails(item.order_id);
            setSelectedProducts(refundData?.products || []);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            notification.error({
                message: "Lỗi hiển thị chi tiết",
                description: "Không thể tải chi tiết đơn hàng.",
            });
            setSelectedProducts([]);
        }
    };

    const showUpdateModal = (item) => {
        setIsUpdateModal(true);
        setSelectedItem(item); // Lưu item vào state
        setCurrentStatusId(item.status_id);
        setSelectedOrderId(item.order_id); // Đảm bảo gán đúng ID đơn hàng
        form.setFieldsValue({
            status_id: undefined,
            note: "",
            employee_evidence: ""
        });
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
        12: [13],
        13: [14],
    };

    const statusCounts = {
        9: returns.filter(item => item.order?.status_id === 9).length,
        10: returns.filter(item => item.order?.status_id === 10).length,
        11: returns.filter(item => item.order?.status_id === 11).length,
        12: returns.filter(item => item.order?.status_id === 12).length,
        13: returns.filter(item => item.order?.status_id === 13).length,
        14: returns.filter(item => item.order?.status_id === 14).length,
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
        onSuccess: (data, variables) => {
            notification.success({
                message: 'Xác nhận thành công!',
            });
            queryClient.invalidateQueries(['returns']);
            setSelectedItem(null);
            setCurrentStatusId(null);
            form.resetFields();
            setIsModal(false);
            setSelectedOrderId(null);
        },
        onError: (error) => {
            console.error('Lỗi cập nhật:', error);
            notification.error({
                message: 'Lỗi cập nhật',
            });
        },
    });

    // ✅ Hàm xác nhận trả hàng
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
        updateOrderStatus(
            { id: selectedItem.order_id, data: payload },
        );
    };

    const { mutate: requestReturn } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.confirmBack(id, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            notification.success({
                message: 'Xác nhận hoàn tiền thành công!',
            });
            queryClient.invalidateQueries(['returns']);
            setSelectedItem(null);
            setCurrentStatusId(null);
            form.resetFields();
            setIsRefundModalVisible(false);
            setSelectedOrderId(null);
        },
        onError: (error) => {
            console.error('Lỗi cập nhật:', error);
            notification.error({
                message: 'Lỗi cập nhật',
            });
        },
    });

    // ✅ Hàm xác nhận hoàn tiền
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

    const { mutate: updateOrder } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.updateOrderStatus(id, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            notification.success({
                message: 'Cập nhật trạng thái đơn hàng thành công!',
            });
            queryClient.invalidateQueries(['returns']);
            setSelectedItem(null);
            setCurrentStatusId(null);
            form.resetFields();
            setIsUpdateModal(false);
            setSelectedOrderId(null);
        },
        onError: (error) => {
            console.error('Lỗi cập nhật:', error);
            notification.error({
                message: 'Lỗi cập nhật',
            });
        },
    });

    // ✅ Hàm cập nhật trạng thái đơn hàng
    const handleUpdate = async (values) => {
        if (!selectedOrderId) {
            notification.error({ message: "Không tìm thấy đơn hàng để cập nhật!" });
            return;
        }

        // Lấy id người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        const modifiedBy = user?.id;

        const payload = {
            order_status_id: values.status_id,
            note: values.note || "",
            employee_evidence: values.employee_evidence || update || "",
            user_id: modifiedBy,
        };

        updateOrder(
            { id: selectedOrderId, data: payload }, // Sử dụng selectedOrderId
            {
                onSuccess: () => {
                    hideUpdateModal(); // Đóng modal sau khi cập nhật
                    form.resetFields(); // Reset form về trạng thái ban đầu
                    setSelectedOrderId(null); // Xóa ID đã chọn
                },
            }
        );
    };

    const onHandleUpdate = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setUpdate(imageUrl);
            form.setFieldsValue({ employee_evidence: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setUpdate(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ employee_evidence: "" }); // Cập nhật lại giá trị trong form
        }
    };

    // Sửa hàm handleOk để lấy giá trị từ form
    const handleOk = async () => {
        if (!selectedStockOrderId) {
            notification.error({
                message: 'Không tìm thấy đơn hàng để xác nhận!',
            });
            return;
        }

        try {
            const values = await form.validateFields();
            setIsLoading(true);
            const payload = {
                approve_stock: values.approveStock,
                user_id: JSON.parse(localStorage.getItem("user")).id,
            };
            await OrderService.confirmStock(selectedStockOrderId, payload);
            notification.success({
                message: 'Xác nhận số lượng thành công!',
            });
            queryClient.invalidateQueries(['returns']);
            setSelectedItem(null);
            setCurrentStatusId(null);
            form.resetFields();
            setIsModalStock(false);
            setSelectedStockOrderId(null);
        } catch (error) {
            if (error.errorFields) {
                return;
            }
            notification.error({
                message: 'Có lỗi xảy ra khi xác nhận số lượng!',
            });
            console.error('Error confirming stock:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sửa showModalStock và hideModalStock để reset form
    const showModalStock = (item) => {
        setIsModalStock(true);
        setSelectedStockOrderId(item.order_id);
        form.resetFields(); // Reset form khi mở modal
    };

    const hideModalStock = () => {
        setIsModalStock(false);
        setSelectedStockOrderId(null);
        form.resetFields(); // Reset form khi đóng modal
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
            title: "Số tiền (VNĐ)",
            dataIndex: "total_refund_amount",
            key: "total_refund_amount",
            align: "center",
            render: (total_refund_amount) => (total_refund_amount ? formatPrice(total_refund_amount) : ""),
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
                                icon={<CheckOutlined />}
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
                                    setSelectedOrderId(item.order_id);
                                    setIsRefundModalVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}

                    {item.status_id === 12 && (
                        <Tooltip title="Cập nhật">
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<EditOutlined />}
                                onClick={() => showUpdateModal(item)}
                            />
                        </Tooltip>
                    )}

                    {item.status_id === 13 && (
                        <Tooltip title="Cộng số lượng">
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<PlusOutlined />}
                                onClick={() => showModalStock(item)}
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
            title: "Giá hoàn (VNĐ)",
            dataIndex: "return_price",
            align: "center",
            render: (_, record) => {
                const { price, quantity } = record;
                const returnPrice = quantity ? price / quantity : 0;
                return formatPrice(returnPrice);
            },
        },
        {
            title: "Thành tiền (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
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

            <Input.Search
                className="search-input"
                placeholder="Tìm kiếm mã đơn hàng..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
            />

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={dataSource.length > 0 ? dataSource : []}
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
                            key: index,
                            index: index + 1,
                            name: product.name,
                            attributes: product.attributes, // Dùng để hiển thị thuộc tính trong cột "Tên sản phẩm"
                            quantity: product.quantity || 0,
                            price: product.price || 0,
                            total: (product.quantity || 0) * (product.price || 0), // Tính thành tiền
                        }))}
                        pagination={false}
                        summary={() => {
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        <strong>Số tiền hoàn trả (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(refundDetails?.total_refund_amount || 0)}</strong>
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

            <Modal
                title="Cập nhật trạng thái đơn hàng"
                visible={isUpdateModal}
                onCancel={hideUpdateModal}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate}>
                    <Row gutter={24}>
                        <Col span={12} className="col-item">
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

                            <Form.Item label="Ghi chú" name="note">
                                <TextArea className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12} className="col-item">
                            <Form.Item
                                label="Ảnh xác nhận"
                                name="employee_evidence"
                                getValueFromEvent={(e) => e?.file?.response?.secure_url || ""}
                            >
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{ upload_preset: "quangOsuy" }}
                                    onChange={onHandleUpdate}
                                >
                                    {!update && (
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
                        <Button type="primary" htmlType="submit">
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Xác nhận cộng số lượng"
                open={isModalStock}
                onCancel={hideModalStock}
                footer={null} // Ẩn footer mặc định (bao gồm nút okText và cancelText)
            >
                <Form
                    form={form}
                    onFinish={handleOk} // Gọi handleOk khi submit form
                    layout="vertical"
                >
                    <Form.Item
                        name="approveStock"
                        label="Bạn có muốn cộng lại số lượng vào kho không?"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn một tùy chọn!",
                            },
                        ]}
                    >
                        <Radio.Group>
                            <Radio value={true}>Có</Radio>
                            <Radio value={false}>Không</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <div className="add">
                        <Button type="primary" htmlType="submit" loading={isLoading}>
                            Xác nhận
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default Back