import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Switch, Form, Input, Select, notification } from "antd";
import { categoryServices } from './../../services/categories';
import { PlusOutlined } from '@ant-design/icons';
import formatDate from '../../utils/formatDate';
import slugify from 'slugify';

const { Option } = Select;

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    const columns = [
        { 
            title: 'STT', 
            dataIndex: 'id', 
            key: 'id', align: "center", 
            render: (_, __, index) => index + 1 
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
        { 
            title: 'Thao tác', 
            key: 'action', 
            align: "center",
            render: (_, record) => <Button type="primary" onClick={() => handleShowModal(record)}>Update</Button>,
        }
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
            <h1 className="mb-5">Danh sách danh mục</h1>
            <div className="btn-brand">
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => handleShowModal()}
                >
                    Thêm danh mục
                </Button>
            </div>

            {/* Modal */}
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
                    <Form.Item 
                        label="Tên danh mục" 
                        name="name" 
                        rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
                    >
                        <Input className='input-item' onChange={handleNameChange}/>
                    </Form.Item>

                    <Form.Item 
                        label="Slug" 
                        name="slug" 
                        rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                    >
                        <Input className='input-item'/>
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
