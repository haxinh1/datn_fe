import { Table, notification, Skeleton, Checkbox, Form, Row, Col, Radio, Upload, Button, Input, Image, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderService } from '../services/order';
import { RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const Return = () => {
    const { id } = useParams();
    const [orderDetails, setOrderDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [returnReason, setReturnReason] = useState(""); // Lý do trả hàng
    const [selectedReturnReason, setSelectedReturnReason] = useState(""); // Lý do trả hàng đã chọn
    const [isCustomReason, setIsCustomReason] = useState(false);
    const [video, setVideo] = useState("");
    const [form] = Form.useForm();
    const [quantities, setQuantities] = useState({});
    const navigate = useNavigate()
    const [banks, setBanks] = useState([]);
    const [image, setImage] = useState("");

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await OrderService.getOrderById(id);
                setOrderDetails(response);
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải chi tiết đơn hàng.",
                });
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

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

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Hàm xử lý thay đổi trạng thái checkbox khi người dùng chọn hoặc bỏ chọn
    const handleSelectChange = (key) => {
        setSelectedRowKeys((prevSelectedRowKeys) => {
            if (prevSelectedRowKeys.includes(key)) {
                return prevSelectedRowKeys.filter((id) => id !== key);
            } else {
                return [...prevSelectedRowKeys, key];
            }
        });
    };

    // Hàm xử lý chọn tất cả checkbox
    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            setSelectedRowKeys(orderDetails.map((item) => {
                const variant = item.variants?.[0];
                return variant ? `${item.product_id}-${variant.variant_id}` : `p-${item.product_id}`;
            }));
        } else {
            setSelectedRowKeys([]);
        }
    };

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

    const handleSubmit = async () => {
        if (!selectedRowKeys.length) {
            return notification.error({ message: "Vui lòng chọn ít nhất 1 sản phẩm để trả" });
        }

        const reasonToSend = selectedReturnReason === "other" ? returnReason : selectedReturnReason;

        const user = JSON.parse(localStorage.getItem("user"));
        const user_id = user?.id || user?.user_id;

        const products = selectedRowKeys.map((key) => {
            if (key.startsWith("p-")) {
                const product_id = parseInt(key.slice(2), 10);
                return {
                    product_id,
                    product_variant_id: null,
                    quantity: Number(quantities[key]) || 1,
                };
            } else if (key.includes("-")) {
                const [product_id, variant_id] = key.split("-");
                return {
                    product_id: parseInt(product_id, 10),
                    product_variant_id: parseInt(variant_id, 10),
                    quantity: Number(quantities[key]) || 1,
                };
            }
        });

        // Sử dụng form.getFieldValue để lấy giá trị các trường nhập liệu
        const bank_account_number = form.getFieldValue('bank_account_number');
        const bank_name = form.getFieldValue('bank_name');

        const payload = {
            user_id,
            reason: reasonToSend,
            employee_evidence: video, // Video vẫn là string URL
            bank_account_number: bank_account_number || null, // Lấy giá trị từ form
            bank_name: bank_name || null, // Lấy giá trị từ form
            bank_qr: image || null, // Đảm bảo đây là URL của ảnh QR
            products,
        };

        console.log("📦 Payload gửi đi:", payload); // Log để kiểm tra lại

        try {
            await OrderService.returnOrder(id, payload);

            notification.success({
                message: "Thành công",
                description: "Gửi yêu cầu trả hàng thành công.",
            });

            // Reset form sau khi gửi
            setSelectedRowKeys([]);
            setQuantities({});
            setReturnReason("");
            setSelectedReturnReason("");
            setVideo("");
            form.resetFields();
            navigate(`/dashboard/backcl/${user_id}`);
        } catch (error) {
            console.error("Lỗi gửi yêu cầu trả hàng:", error);
            notification.error({
                message: "Lỗi",
                description: "Gửi yêu cầu trả hàng thất bại.",
            });
        }
    };

    const detailColumns = [
        {
            title: (
                <Checkbox
                    indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < orderDetails.length}
                    checked={selectedRowKeys.length === orderDetails.length}
                    onChange={handleSelectAllChange}
                />
            ),
            render: (_, record) => {
                const variant = record.variants?.[0];
                const key = variant ? `${record.product_id}-${variant.variant_id}` : `p-${record.product_id}`;
                return (
                    <Checkbox
                        checked={selectedRowKeys.includes(key)}
                        onChange={() => handleSelectChange(key)}
                    />
                );
            },
            dataIndex: "select",
            align: 'center'
        },
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
                const thumbnail = record.variants?.[0]?.variant_thumbnail || record.thumbnail; // Kiểm tra nếu có variant, nếu không thì lấy thumbnail của sản phẩm
                const productName = record.name || '';
                const variantAttributes = record.variants?.map(variant => {
                    const attributes = variant.attributes.map(attr => attr.attribute_name).join(" - ");
                    return `${productName} - ${attributes}`;
                }).join(", ") || productName;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image src={thumbnail} width={60} />
                        <span>{variantAttributes}</span>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
            render: (_, record) => {
                const variant = record.variants?.[0];
                const key = variant ? `${record.product_id}-${variant.variant_id}` : `p-${record.product_id}`;
                return selectedRowKeys.includes(key) && (
                    <Input
                        type="number"
                        min={1}
                        max={record.quantity}
                        value={quantities[key] || ""}
                        onChange={(e) =>
                            setQuantities({
                                ...quantities,
                                [key]: e.target.value,
                            })
                        }
                    />
                );
            }
        },
        {
            title: "Giá hoàn (VNĐ)",
            dataIndex: "refund_amount",
            align: "center",
            render: (refund_amount) => (refund_amount ? formatPrice(refund_amount) : ""),
        },
        {
            title: "Tổng tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => {
                const variant = record.variants?.[0];
                const key = variant ? `${record.product_id}-${variant.variant_id}` : `p-${record.product_id}`;
                const quantity = quantities[key] || 0;
                return formatPrice(quantity * record.refund_amount);
            }
        }
    ];

    return (
        <div>
            <h1 className="mb-5" style={{ color: '#eea287' }}>
                <RollbackOutlined style={{ marginRight: "8px" }} />
                Trả hàng
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={detailColumns}
                    dataSource={orderDetails.map((item, index) => ({
                        ...item,
                        key: item.variants?.[0] ? `${item.product_id}-${item.variants[0].variant_id}` : `p-${item.product_id}`,
                        index: index + 1,
                    }))}
                    pagination={false}
                    summary={() => {
                        const totalAmount = orderDetails.reduce((sum, item) => {
                            const variant = item.variants?.[0];
                            const key = variant ? `${item.product_id}-${variant.variant_id}` : `p-${item.product_id}`;

                            if (selectedRowKeys.includes(key)) {
                                const quantity = Number(quantities[key]) || 0;
                                return sum + (quantity * item.refund_amount);
                            }
                            return sum;
                        }, 0);

                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={5} align="right">
                                        <strong>Tổng tiền hoàn trả (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(totalAmount)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>

                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={5} align="right">
                                        <i style={{fontSize: '16px'}}><strong>Giá hoàn</strong> = giá bán * [ 1 - (điểm tiêu dùng + phiếu giảm giá) / tổng tiền hàng ]</i>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        );
                    }}
                />
            </Skeleton>

            <Form
                layout="vertical"
                form={form}
                onFinish={handleSubmit}
                style={{ marginTop: '20px' }}
            >
                <Row gutter={24}>
                    <Col span={4}></Col>
                    <Col span={8}>
                        <Form.Item
                            label="Lý do trả hàng"
                            name='reason'
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

                    <Col span={8}>
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

                <Row gutter={24}>
                    <Col span={4}></Col>
                    <Col span={12}>
                        {isCustomReason && (
                            <Form.Item label="Nhập lý do trả hàng">
                                <Input.TextArea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    placeholder="Nhập lý do trả hàng tại đây..."
                                />
                            </Form.Item>
                        )}
                    </Col>
                </Row>

                <hr />
                <h1 className="mb-5" style={{ color: '#eea287' }}>
                    Thông tin hoàn tiền
                </h1>
                <Row gutter={24}>
                    <Col span={12} className="col-item">
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

                    <Col span={6} className="col-item">
                        <Form.Item
                            label="Số tài khoản"
                            name="bank_account_number"
                            rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
                        >
                            <Input className="input-item" placeholder="Nhập số tài khoản" />
                        </Form.Item>
                    </Col>

                    <Col span={6} className="col-item">
                        <Form.Item
                            label="QR ngân hàng (nếu có)"
                            name="bank_qr"
                        >
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
        </div>
    );
}

export default Return;