import { CloseCircleOutlined, RollbackOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Form, Image, Input, Modal, notification, Row, Select, Skeleton, Table, Tooltip, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { OrderService } from "../services/order";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "../css/bill.css";
import { useParams } from "react-router-dom";
import axios from "axios";

const Cancels = () => {
    const { id } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hideModal = () => setIsModalOpen(false);
    const [form] = Form.useForm();
    const [banks, setBanks] = useState([]);
    const [image, setImage] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedCancelId, setSelectedCancelId] = useState(null);

    const { data: cancels = [], isLoading, refetch } = useQuery({
        queryKey: ["cancels", id, searchKeyword],
        queryFn: async () => {
            if (searchKeyword.trim()) {
                return await OrderService.searchOrderCancel(searchKeyword);
            } else {
                const response = await OrderService.getCancelByUser(id);
                return Array.isArray(response.order_cancels) ? response.order_cancels : [];
            }
        },
    });

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            refetch(); // gọi lại API với keyword mới
        }, 500); // debounce 500ms

        return () => clearTimeout(delayDebounce);
    }, [searchKeyword]);

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

    const handleSubmitBankInfo = async (values) => {
        try {
            if (!selectedCancelId) return;

            await OrderService.infoBack(selectedCancelId, values); // Dùng order_cancels.id

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
            render: (_, __, index) => (currentPage - 1) * 5 + index + 1,
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "order",
            key: "order",
            align: "center",
            render: (order) => order?.code ?? "", // hoặc order?.code nếu BE trả code
        },
        {
            title: "Lý do hủy đơn",
            dataIndex: "reason",
            key: "reason",
            align: "center",
        },
        {
            title: "Ngày hủy",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) => created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
        },
        {
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "order",
            key: "order_total_amount",
            align: "center",
            render: (order) => order?.total_amount ? formatPrice(order.total_amount) : "",
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
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => {
                // Kiểm tra xem đã có thông tin hoàn tiền chưa
                const hasRefundInfo = item.bank_account_number && item.bank_name;
                // Kiểm tra payment_id: disable nếu payment_id là 2
                const isPaymentDisabled = item.order?.payment_id === 2;

                return (
                    <div className="action-container">
                        <Tooltip title="Yêu cầu hoàn tiền">
                            <Button
                                color="danger"
                                variant="solid"
                                icon={<RollbackOutlined />}
                                onClick={() => {
                                    setSelectedCancelId(item.id);
                                    setIsModalOpen(true);
                                }}
                                disabled={hasRefundInfo || isPaymentDisabled} // Vô hiệu hóa nếu đã có thông tin hoàn tiền hoặc payment_id là 2
                            />
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <h1 className="mb-5" style={{ color: '#eea287' }}>
                <CloseCircleOutlined style={{ marginRight: "8px" }} />
                Đơn hủy
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", }}>
                <Input
                    style={{ width: '400px' }}
                    placeholder="Tìm kiếm mã đơn hàng..."
                    allowClear
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={cancels}
                    pagination={{ pageSize: 5, current: currentPage }}
                    rowKey="id"
                    onChange={(pagination) => setCurrentPage(pagination.current)}
                />
            </Skeleton>

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
                                rules={[
                                    { required: true, message: "Vui lòng nhập số tài khoản" },
                                    {
                                        pattern: /^\d+$/,
                                        message: "Vui lòng không nhập chữ và dấu cách",
                                    },
                                ]}
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
    );
};

export default Cancels;