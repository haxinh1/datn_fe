import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Select, Upload, Row, Col, Table, Tag } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "../admin/product/add.css";

const Test = () => {
    const [attributes, setAttributes] = useState([]);
    const [forms, setForms] = useState([{ id: Date.now(), name: "", values: [], inputValue: "" }]);
    const [variants, setVariants] = useState([]);

    // Thêm giá trị thuộc tính
    const handleAddValue = (formId) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId && form.inputValue && !form.values.includes(form.inputValue)) {
                return { ...form, values: [...form.values, form.inputValue], inputValue: "" };
            }
            return form;
        });
        setForms(updatedForms);
    };

    // Hàm xoá giá trị thuộc tính
    const handleRemoveValue = (formId, value) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId) {
                const updatedValues = form.values.filter((v) => v !== value);

                if (updatedValues.length === 0) {
                    const updatedAttributes = attributes.filter((attr) => attr.name !== form.name);
                    setAttributes(updatedAttributes);
                    generateVariants(updatedAttributes);
                }

                return { ...form, values: updatedValues };
            }
            return form;
        });

        setForms(updatedForms);

        const updatedVariants = variants.filter((variant) => {
            return !Object.values(variant).includes(value);
        });

        setVariants(updatedVariants);
    };

    // Hàm thêm thuộc tính
    const handleAddAttribute = (formId) => {
        const form = forms.find((f) => f.id === formId);
        if (form.name && form.values.length > 0) {
            const updatedAttributes = [...attributes, { name: form.name, values: form.values }];
            setAttributes(updatedAttributes);
            generateVariants(updatedAttributes);
            setForms([...forms, { id: Date.now(), name: "", values: [], inputValue: "" }]);
        }
    };

    // Hàm tạo biến thể
    const generateVariants = (attrs) => {
        const combinations = attrs.reduce((acc, attr) => {
            const temp = [];
            acc.forEach((comb) => {
                attr.values.forEach((value) => {
                    temp.push({ ...comb, [attr.name]: value });
                });
            });
            return temp;
        }, [{}]);
    
        // Chỉ giữ lại trường "quantity"
        setVariants(
            combinations.map((item, index) => ({
                key: index,
                ...item,
                quantity: 0, // Chỉ thêm trường "quantity"
            }))
        );
    };    

    // Hàm xóa biến thể
    const handleRemoveVariant = (variantKey) => {
        const updatedVariants = variants.filter((variant) => variant.key !== variantKey);
        setVariants(updatedVariants);
    };

    const columns = [
        ...attributes.map((attr) => ({
            title: attr.name,
            dataIndex: attr.name,
            key: attr.name,
            align: 'center',
        })),
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => <InputNumber min={0} />,
            align: 'center',
        },
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleRemoveVariant(record.key)} // Gọi hàm xóa khi nhấn
                />
            ),
        },
    ];

    return (
        <div className="container">

            <h2>Thuộc tính và giá trị</h2>
            <div className="attribute">
                <Input
                    name="name"
                    placeholder="Nhập tên thuộc tính mới"
                    className="input-attribute"
                />
                <Button
                    className="btn-item"
                    type="primary"
                >
                    Tạo thuộc tính
                </Button>
            </div>

            <div className="attribute">
                <Input
                    name="name"
                    placeholder="Nhập tên giá trị mới"
                    className="input-attribute"
                />
                <Button
                    className="btn-item"
                    type="primary"
                >
                    Tạo giá trị
                </Button>
            </div>

            <hr />
            <h2>Biến thể</h2>
            {forms.map((form) => (
                <div key={form.id}>
                    <div className="attribute">
                        <Select
                            className="input-attribute"
                            placeholder="Chọn thuộc tính"
                            allowClear
                        >
                            <Option></Option>
                        </Select>

                        <Select
                            className="input-attribute"
                            placeholder="Chọn giá trị"
                            allowClear
                        >
                            <Option></Option>
                        </Select>

                        <Button
                            className="btn-item"
                            type="primary"
                        >
                            Thêm giá trị
                        </Button>
                    </div>
                    <div>
                        {form.values.map((value) => (
                            <Tag
                                key={value}
                                closable
                                onClose={() => handleDeleteTag(form.id, value)}
                                className="tag-list"
                            >
                                {value}
                            </Tag>
                        ))}
                    </div>
                </div>
            ))}

            <hr />

            <h2>Danh sách hàng hóa cùng loại</h2>
            <Table dataSource={variants} columns={columns} pagination={false} />

            <div className="add">
                <Button 
                    type="primary" 
                    size="large" 
                    htmlType="submit"
                >
                    Thêm sản phẩm
                </Button>
            </div>
        </div>
    );
};

export default Test;
