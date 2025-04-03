import { EditOutlined, EyeOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, Select, notification, Row, Col, Input, DatePicker, Switch, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import TextArea from 'antd/es/input/TextArea';
import { CouponServices } from '../services/coupon';
import formatDate from '../utils/formatDate';
import "../css/add.css";
import "../css/list.css";

const Coupon = () => {
    const [coupon, setCoupon] = useState([]);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
        style: "decimal",
        maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const handleShowModal = async (coupon) => {
        setEditingCoupon(coupon);
        if (coupon) {
            console.log(coupon);
            form.setFieldsValue({
                title: coupon.title,
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                usage_limit: coupon.usage_limit,
                start_date: dayjs(coupon.start_date),
                end_date: dayjs(coupon.end_date),
                is_active: coupon.is_active
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            align: "center",
        },
        {
            title: "Mã",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Tên mã",
            dataIndex: "title",
            key: "title",
            align: "center",
        },
        {
            title: "Loại phiếu giảm giá",
            dataIndex: "discount_type",
            key: "discount_type",
            align: "center",
            render: (discount_type) => discount_type === "percent" ? "Giảm theo %" : "Giảm tiền",
        },
        {
            title: "Số lượng",
            dataIndex: "usage_limit",
            key: "quantity",
            align: "center",
        },
        {
            title: "Giá trị giảm",
            dataIndex: "discount_value",
            key: "discount_value",
            align: "center",
            render: (discount_value) => (discount_value ? formatPrice(discount_value) : ""),
        },
        {
            title: "Ngày áp dụng",
            dataIndex: "date_range",
            key: "date_range",
            align: "center",
            render: (_, record) => `${dayjs(record.start_date).format("DD/MM")} - ${dayjs(record.end_date).format("DD/MM")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            align: "center",
            render: (isActive) => (
                <span className={isActive ? 'action-link-blue' : 'action-link-red'}>
                    {isActive ? 'Đang áp dụng' : 'Dừng áp dụng'}
                </span>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="action-container">
                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined />}
                            type="link"
                            onClick={() => handleShowModal(record)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const onSubmit = async (values) => {
        const payload = {
            title: values.title,
            code: values.code,
            description: values.description,
            discount_type: values.discount_type,
            discount_value: values.discount_value,
            usage_limit: values.usage_limit,
            start_date: values.start_date,
            end_date: values.end_date,
            is_active: values.is_active
        };

        let response;

        if (editingCoupon) {
            response = await CouponServices.updateCoupon(editingCoupon.id, payload);
        } else {
            response = await CouponServices.createCoupon(payload);
        }

        if (response) {
            fetchData();
            notification.success({
                message: editingCoupon ? "Cập nhật mã giảm giá thành công!" : "Tạo mã giảm giá thành công!",
            });
        }

        setIsModalVisible(false);
        form.resetFields();
    };

    const fetchData = async () => {
        const { data } = await CouponServices.fetchCoupons();
        setCoupon(data);

    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h1 className="mb-5">
                <ProjectOutlined style={{ marginRight: "8px" }} />
                Mã giảm giá
            </h1>
            <div className="btn-brand">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleShowModal()}
                >
                    Thêm mới
                </Button>
            </div>

            <Table
                dataSource={coupon}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingCoupon ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onSubmit}
                >
                    <Row gutter={24}>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Tên mã giảm giá"
                                name="title"
                            >
                                <Input className='input-item' />
                            </Form.Item>
                        </Col>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Mã giảm giá"
                                name="code"
                                rules={[{ required: true, message: "Vui lòng chọn Code" }]}
                            >
                                <Input className='input-item' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <TextArea className='input-item' />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Kiểu giảm giá"
                                name="discount_type"
                                rules={[{ required: true, message: "Vui lòng chọn kiểu giảm giá" }]}
                            >
                                <Select
                                    placeholder="Chọn kiểu giảm giá"
                                    className='input-item'
                                >
                                    <Option value="percent">%</Option>
                                    <Option value="fix_amount">VND</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Ngày bắt đầu"
                                name="start_date"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày áp dụng",
                                    },
                                ]}
                            >
                                <DatePicker
                                    className="input-item"
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Số lần áp dụng"
                                name="usage_limit"
                                rules={[{ required: true, message: "Vui lòng chọn số lần áp dụng" }]}
                            >
                                <InputNumber min={1} className='input-item' />
                            </Form.Item> 
                        </Col>

                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Giá trị giảm giá"
                                name="discount_value"
                                dependencies={["discount_type"]}
                                rules={[
                                    { required: true, message: "Vui lòng chọn giá trị giảm giá" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const discountType = getFieldValue("discount_type");
                                            if (discountType === "percent") {
                                                if (value < 1 || value > 100) {
                                                    return Promise.reject("Giá trị phải từ 1 - 100%");
                                                }
                                            }
                                            return Promise.resolve();
                                        }
                                    })
                                ]}
                            >
                                <InputNumber
                                    className="input-item"
                                    min={1}
                                    formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                                    parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                                    onChange={(value) => {
                                        form.setFieldsValue({ [`discount_value_${record.key}`]: value }); // Cập nhật giá vào form
                                        updateItem(record.key, "discount_value", value); // ✅ Cập nhật giá vào danh sách
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Ngày kết thúc"
                                name="end_date"
                                dependencies={["start_date"]}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày kết thúc",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const startDate = getFieldValue("start_date");
                                            if (!value || !startDate) return Promise.resolve();

                                            if (value.isBefore(startDate, "day")) {
                                                return Promise.reject("Ngày kết thúc không thể trước ngày bắt đầu!");
                                            }
                                            return Promise.resolve();
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker
                                    className="input-item"
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) => {
                                        const startDate = form.getFieldValue("start_date");
                                        return current && startDate && current.isBefore(startDate, "day");
                                    }}
                                />
                            </Form.Item>

                            <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button type="primary" htmlType="submit">
                            {editingCoupon ? "Cập nhật" : "Thêm"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Coupon;
