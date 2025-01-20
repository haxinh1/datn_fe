import React, { useState } from "react";
import { Button, Input, Select, Tag, Table, notification } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import "./add.css";
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import { productsServices } from './../../services/product';

const { Option } = Select;

const Attribute = () => {
    const [forms, setForms] = useState([]);
    const [variants, setVariants] = useState([]);

    const { data: attributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/attributes`);
            return response.data.data;
        }
    });

    // Thêm giá trị vào thuộc tính
    const handleAddValue = async (formId) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId) {
                if (!form.name) {
                    notification.error({ message: "Vui lòng chọn thuộc tính trước khi thêm giá trị" });
                    return form;
                }
                if (!form.inputValue.trim()) {
                    notification.error({ message: "Giá trị không được để trống" });
                    return form;
                }
                if (form.values.includes(form.inputValue)) {
                    notification.error({ message: "Giá trị này đã được thêm trước đó" });
                    return form;
                }

                // Gọi API thêm giá trị thuộc tính
                productsServices
                    .createAttributeValue(form.name, { value: form.inputValue }) // Gọi API
                    .then((response) => {
                        notification.success({
                            message: "Thêm giá trị thuộc tính thành công!",
                            description: `Giá trị "${form.inputValue}" đã được thêm.`,
                        });

                        // Cập nhật state sau khi thêm thành công
                        setForms((prevForms) =>
                            prevForms.map((f) =>
                                f.id === form.id
                                    ? { ...f, values: [...f.values, form.inputValue], inputValue: "" }
                                    : f
                            )
                        );
                    })
                    .catch((error) => {
                        notification.error({
                            message: "Lỗi khi thêm giá trị thuộc tính",
                            description: error.response?.data || "Đã xảy ra lỗi, vui lòng thử lại.",
                        });
                    });

                return form; // Trả về form không thay đổi ngay lập tức, cập nhật sau API thành công
            }
            return form;
        });

        setForms(updatedForms); // Cập nhật state với form đã xử lý
    };

    // Thêm form biến thể
    const handleAddVariantForm = () => {
        setForms([...forms, { id: Date.now(), name: "", values: [], inputValue: "" }]);
    };

    // Tạo tổ hợp biến thể
    const generateVariants = (forms) => {
        if (forms.length === 0 || forms.some((form) => !form.name || form.values.length === 0)) {
            setVariants([]);
            return;
        }

        const combine = (arr) => arr.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]]);
        const combinations = combine(forms.map((form) => form.values));

        const updatedVariants = combinations.map((combo, index) => {
            const variant = {};
            combo.forEach((value, i) => {
                variant[forms[i].name] = value;
            });
            return { key: index, ...variant, quantity: 0 };
        });

        setVariants(updatedVariants);
    };

    // Xóa biến thể
    const handleRemoveVariant = (variantKey) => {
        const updatedVariants = variants.filter((variant) => variant.key !== variantKey);
        setVariants(updatedVariants);
    };

    // Cột cho bảng biến thể
    const columns = [
        ...forms.map((form) => ({
            title: form.name,
            dataIndex: form.name,
            key: form.name,
            align: "center",
        })),
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => <Input type="number" min={0} />,
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveVariant(record.key)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h2>Biến thể</h2>
            {forms.map((form) => (
                <div key={form.id}>
                    <div className="attribute">
                        <Select
                            className="input-attribute"
                            placeholder="Chọn thuộc tính"
                            allowClear
                            onChange={(value) => {
                                if (forms.some((f) => f.name === value && f.id !== form.id)) {
                                    notification.error({
                                        message: `Thuộc tính "${value}" đã được chọn trước đó`,
                                    });
                                    return;
                                }
                                const updatedForms = forms.map((f) =>
                                    f.id === form.id ? { ...f, name: value } : f
                                );
                                setForms(updatedForms);
                            }}
                        >
                            {attributes && attributes.length > 0 ? (
                                attributes.map((attr) => (
                                    <Option key={attr.id} value={attr.name}>
                                        {attr.name}
                                    </Option>
                                ))
                            ) : (
                                <Option disabled>Không có thuộc tính nào</Option>
                            )}
                        </Select>

                        <Input
                            className="input-attribute"
                            placeholder="Nhập giá trị"
                            value={form.inputValue}
                            onChange={(e) => {
                                const updatedForms = forms.map((f) =>
                                    f.id === form.id ? { ...f, inputValue: e.target.value } : f
                                );
                                setForms(updatedForms);
                            }}
                        />

                        <Button
                            className="btn-item"
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleAddValue(form.id)}
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

            <Button
                type="dashed"
                onClick={handleAddVariantForm}
                style={{ marginTop: 16 }}
            >
                Thêm thuộc tính
            </Button>

            <h2 style={{ marginTop: 32 }}>Danh sách hàng hóa cùng loại</h2>
            <Table dataSource={variants} columns={columns} pagination={false} />
        </div>
    );
};

export default Attribute;
