import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Switch, Form, Input, Select, notification, Row, Col, Upload, Image } from "antd";
import { categoryServices } from './../../services/categories';
import { BookOutlined, PlusOutlined, TableOutlined, UploadOutlined } from '@ant-design/icons';
import formatDate from '../../utils/formatDate';
import slugify from 'slugify';

const { Option } = Select;

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [image, setImage] = useState("");

    const columns = [
        {
            title: 'STT',
            dataIndex: 'id',
            key: 'id', align: "center",
            render: (_, __, index) => index + 1
        },
        {
            title: "Ảnh",
            dataIndex: "thumbnail",
            key: "thumbnail",
            render: (_, item) => <Image width={90} src={item.thumbnail} />,
            align: "center",
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            align: "center"
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            align: "center"
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            align: "center",
            render: (isActive) => (
                <span className={`px-2 py-1 rounded border ${isActive ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            align: "center",
            render: (createdAt) => formatDate(createdAt)
        },
        // {
        //     title: 'Thao tác',
        //     key: 'action',
        //     align: "center",
        //     render: (_, record) => (
        //         <span className="action-link action-link-blue" onClick={() => handleShowModal(record)}>
        //             Cập nhật
        //         </span>
        //     ),
        // }
    ];

    const handleShowModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue({
                name: category.name,
                parentId: category.parent_id ? category.parent_id.toString() : "",
                slug: category.slug,
                ordinal: category.ordinal ? category.ordinal.toString() : "",
                is_active: category.is_active,
                thumbnail: category.thumbnail,
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const onSubmit = async (values) => {
        const payload = {
            name: values.name,
            parent_id: values.parentId ? Number(values.parentId) : null,
            slug: values.slug,
            ordinal: Number(values.ordinal),
            is_active: values.is_active,
            thumbnail: values.thumbnail,
        };

        let response;
        if (editingCategory) {
            response = await categoryServices.updateCategory(editingCategory.id, payload);
        } else {
            response = await categoryServices.createCategory(payload);
        }

        if (response) {
            fetchData();
            notification.success({
                message: editingCategory ? "Cập nhật danh mục thành công!" : "Tạo danh mục thành công!",
            });
        }

        setIsModalVisible(false);
        form.resetFields();
    };

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ thumbnail: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        } else if (info.file.status === "removed") {
            setImage(""); // Xóa ảnh khi người dùng xóa
            form.setFieldsValue({ thumbnail: "" }); // Cập nhật lại giá trị trong form
        }
    };

    const fetchData = async () => {
        const response = await categoryServices.fetchCategories();
        setCategories(response);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // slug tạo tự động
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true, locale: "vi" });
        form.setFieldsValue({ name, slug });
    };

    return (
        <>
            <h1 className="mb-5">
                <TableOutlined style={{ marginRight: "8px" }} />
                Danh sách danh mục
            </h1>
            <div className="btn-brand">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleShowModal()}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Modal
                title={editingCategory ? "Cập nhật danh mục" : "Thêm danh mục"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onSubmit}
                >
                    <Row gutter={24}>
                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Tên danh mục"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
                            >
                                <Input className='input-item' onChange={handleNameChange} />
                            </Form.Item>

                            <Form.Item label="Danh mục cha" name="parentId">
                                <Select
                                    placeholder="Chọn danh mục cha"
                                    className='input-item'
                                    allowClear
                                >
                                    {categories.map(category => (
                                        <Option key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Ảnh bìa"
                                name="thumbnail"
                                getValueFromEvent={(e) => e?.file?.response?.secure_url || ""}
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

                        <Col span={12} className='col-item'>
                            <Form.Item
                                label="Slug"
                                name="slug"
                                rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                            >
                                <Input className='input-item' />
                            </Form.Item>

                            <Form.Item label="Thứ tự hiển thị" name="ordinal">
                                <Select
                                    placeholder="Chọn thứ tự"
                                    className='input-item'
                                >
                                    <Option value="1">1</Option>
                                    <Option value="2">2</Option>
                                    <Option value="3">3</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Trạng thái" name="is_active" valuePropName="checked">
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="add">
                        <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                            Tạo
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Table
                dataSource={categories}
                columns={columns}
                rowKey="id"
                pagination={false}
                expandable={{ childrenColumnName: 'children' }}
            />
        </>
    );
};

export default Categories;
