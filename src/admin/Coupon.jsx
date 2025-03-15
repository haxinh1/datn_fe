import { EditOutlined, EyeOutlined, PlusOutlined, ProjectOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Modal, Form, Select, notification, Row, Col, Input, DatePicker, Switch } from 'antd';
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
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const showDetailModal = async (id) => {

        const response = await CouponServices.getCounponById(id);
        console.log(response);


        if (response.success && response.data) {
            setSelectedCoupon([response.data]);
        }

        setIsDetailModalVisible(true);


    };

    console.log(selectedCoupon);

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

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
        setSelectedCoupon(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // bấm nút chi tiết
    const detailColumn = [
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
        },
        {
            title: "Ngày áp dụng",
            dataIndex: "start_date",
            key: "start_date",
            align: "center",
            render: (date) => formatDate(date),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "end_date",
            key: "end_date",
            align: "center",
            render: (date) => formatDate(date),
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
    ]

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
        },
        {
            title: "Ngày áp dụng",
            dataIndex: "start_date",
            key: "start_date",
            align: "center",
            render: (date) => formatDate(date),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "end_date",
            key: "end_date",
            align: "center",
            render: (date) => formatDate(date),
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
                    <Tooltip title="Xem thêm">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            type='link'
                            onClick={() => showDetailModal(record.id)}
                        />
                    </Tooltip>
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
                Quản lý mã giảm giá
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

            {/* Modal Chi Tiết */}
            <Modal
                title="Chi tiết mã giảm giá"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={selectedCoupon}
                    rowKey={"id"}
                    columns={detailColumn}
                    pagination={false}
                />
            </Modal>

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
                                <Input className='input-item' />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Số lần áp dụng"
                        name="usage_limit"
                        rules={[{ required: true, message: "Vui lòng chọn số lần áp dụng" }]}
                    >
                        <Input className='input-item' />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={12} className="col-item">
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
                                    disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12} className="col-item">
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
                                    disabledDate={(current) => {
                                        const startDate = form.getFieldValue("start_date");
                                        return current && startDate && current.isBefore(startDate, "day");
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

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
