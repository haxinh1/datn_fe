import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Select, Upload, Row, Col, Table, Tag, notification, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./add.css";

const { Option } = Select;

const Add = () => {
    const queryClient = useQueryClient();
    const [newAttribute, setNewAttribute] = useState("");
    const [forms, setForms] = useState([]);
    const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);

    // lấy dữ liệu
    const { data: attributes, isLoading } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3000/attributes`);
            return response.data;
        },
    });

    // thêm thuộc tính
    const addAttributeMutation = useMutation({
        mutationFn: async (newAttr) => {
            await axios.post(`http://localhost:3000/attributes`, newAttr);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            notification.success({ message: "Thuộc tính đã được thêm vào phần biến thể" });
            setNewAttribute("");
        },
    });

    const handleAddAttribute = () => {
        if (!newAttribute.trim()) {
            notification.error({ message: "Tên thuộc tính không được để trống!" });
            return;
        }
        const newAttr = { id: Date.now().toString(), name: newAttribute.trim() };
        addAttributeMutation.mutate(newAttr);
    };

    // thêm biến thể
    const handleAddValue = (formId) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId) {
                if (!form.name) {
                    notification.error({
                        message: "Vui lòng chọn thuộc tính",
                    });
                    return form;
                }
                if (!form.inputValue || form.inputValue.trim() === "") {
                    notification.error({
                        message: "Giá trị không được để trống",
                    });
                    return form;
                }
    
                // Kiểm tra nếu giá trị đã tồn tại trong danh sách
                if (form.values.includes(form.inputValue)) {
                    notification.error({
                        message: "Giá trị này đã được thêm trước đó",
                    });
                    return form;
                }
                if (form.inputValue && !form.values.includes(form.inputValue)) {
                    return {
                        ...form,
                        values: [...form.values, form.inputValue],
                        inputValue: "",
                    };
                }
            }
            return form;
        });

        setForms(updatedForms);
    };

    // xóa tag giá trị
    const handleRemoveValue = (formId, value) => {
        const updatedForms = forms.map((form) =>
            form.id === formId
                ? { ...form, values: form.values.filter((v) => v !== value) }
                : form
        );
        setForms(updatedForms);
    };

    // Generate columns dynamically
    const generateColumns = (forms) => {
        const dynamicColumns = forms
            .filter((form) => form.name)
            .map((form) => ({
                align: "center",
                title: form.name,
                dataIndex: form.name,
            }));

        const staticColumns = [
            {
                title: "Số lượng",
                dataIndex: "quantity",
                align: "center",
                render: (_, record) => (
                    <InputNumber
                        value={record.quantity || ""}
                        onChange={(e) => handleUpdateQuantity(record.key, e.target.value)}
                    />
                ),
            },
            {
                title: "Thao tác",
                align: "center",
                render: (_, record) => (
                    <Button 
                        color="danger" 
                        variant="solid"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteRow(record.key)}
                    >
                        Xóa
                    </Button>
                ),
            },
        ];

        return [...dynamicColumns, ...staticColumns];
    };

    // cột bảng động
    const generateTableData = (forms) => {
        return forms.reduce((acc, form) => {
            if (!form.values.length) return acc;
            return acc.flatMap((variant) =>
                form.values.map((value) => ({
                    ...variant,
                    [form.name]: value,
                    key: `${variant.key || ""}-${form.name}-${value}`,
                }))
            );
        }, [{}]);
    };

    // thêm form biến thể
    const handleAddVariantForm = () => {
        setForms([...forms, { id: Date.now(), name: "", values: [], inputValue: "" }]);
    };

    // Xóa biến thể
    const handleDeleteRow = (key) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Biến thể sau khi xóa sẽ không thể khôi phục",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: () => {
                const updatedTableData = tableData.filter((row) => row.key !== key);
                setTableData(updatedTableData);
            },
        });
    };

    // Update quantity
    const handleUpdateQuantity = (key, value) => {
        const updatedTableData = tableData.map((row) =>
            row.key === key ? { ...row, quantity: value } : row
        );
        setTableData(updatedTableData);
    };

    // Sync columns and table data when forms change
    useEffect(() => {
        setColumns(generateColumns(forms));
        setTableData(generateTableData(forms));
    }, [forms]);

    return (
        <div className="container">
            <h1 className="mb-5">Thêm sản phẩm mới</h1>

            <Form name="basic" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} labelAlign="top">
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                        >
                            <Input className="input-item"/>
                        </Form.Item>
                        <Form.Item
                            label="Giá nhập"
                            rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}
                        >
                            <InputNumber className="input-item"/>
                        </Form.Item>
                        <Form.Item
                            label="Giá bán"
                            rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                        >
                            <InputNumber className="input-item"/>
                        </Form.Item>
                        <Form.Item label="Danh mục">
                            <Select className="input-item">
                                <Option>Điện thoại</Option>
                                <Option>Máy tính</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item label="Ảnh sản phẩm">
                            <Upload listType="picture-card" multiple>
                                <div>
                                    <PlusOutlined />
                                    <div>Tải ảnh lên</div>
                                </div>
                            </Upload>
                        </Form.Item>
                        <Form.Item label="Mô tả sản phẩm">
                            <TextArea rows={8} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <hr />

            <h2>Thuộc tính</h2>
            <div className="attribute">
                <Input
                    className="input-attribute"
                    placeholder="Nhập tên thuộc tính mới"
                    value={newAttribute}
                    onChange={(e) => setNewAttribute(e.target.value)}
                />
                <Button type="primary" onClick={handleAddAttribute} className="btn-item">
                    Tạo thuộc tính
                </Button>
            </div>

            <hr />

            <div>
                <h2>Biến thể</h2>
                {forms.map((form) => (
                    <div key={form.id}>
                        <div className="attribute">
                            <Select
                                className="input-attribute"
                                placeholder="Chọn thuộc tính"
                                allowClear
                                value={form.name}
                                onChange={(value) => {
                                    // Kiểm tra nếu thuộc tính đã được chọn ở form khác
                                    const isAlreadySelected = forms.some((f) => f.name === value && f.id !== form.id);

                                    if (isAlreadySelected) {
                                        notification.error({
                                            message: `Thuộc tính "${value}" đã được chọn trước đó`,
                                        });
                                        return;
                                    }

                                    // Cập nhật giá trị của form
                                    const updatedForms = forms.map((f) =>
                                        f.id === form.id ? { ...f, name: value } : f
                                    );
                                    setForms(updatedForms);
                                }}
                            >
                                {attributes?.map((attr) => (
                                    <Option key={attr.id} value={attr.name}>
                                        {attr.name}
                                    </Option>
                                ))}
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
                                onPressEnter={() => handleAddValue(form.id)}
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
                        
                        <div className="tag-list">
                            {form.values.map((value) => (
                                <Tag
                                    key={value}
                                    closable
                                    onClose={() => handleRemoveValue(form.id, value)}
                                >
                                    {value}
                                </Tag>
                            ))}
                        </div>
                    </div>
                ))}
                <Button 
                    className="btn-item"
                    color="primary" 
                    variant="dashed" 
                    onClick={handleAddVariantForm}
                >
                    Thêm biến thể
                </Button>
            </div>

            <hr />

            <h2>Bảng thuộc tính</h2>
            <Table columns={columns} dataSource={tableData} pagination={false} />

            <div className="add">
                <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    className="btn-item"
                >
                    Thêm sản phẩm
                </Button>
            </div>
        </div>
    );
};

export default Add;
