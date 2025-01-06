import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Select, Upload, Row, Col, Table, Tag, Modal, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./add.css";

const { Option } = Select;

const Edit = () => {
    const queryClient = useQueryClient();
    const [newAttribute, setNewAttribute] = useState("");
    const [forms, setForms] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);

    const { data } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await axios.get(`http://localhost:3000/attributes`);
            return response.data;
        },
    });

    const addAttributeMutation = useMutation({
        mutationFn: async (newAttr) => {
            await axios.post(`http://localhost:3000/attributes`, newAttr);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            setNewAttribute("");
        },
    });

    const handleAddAttribute = () => {
        if (!newAttribute.trim()) {
            notification.error({ message: "Tên thuộc tính không được để trống" });
            return;
        }
        const newAttr = { id: Date.now().toString(), name: newAttribute.trim() };
        addAttributeMutation.mutate(newAttr, {
            onSuccess: () => {
                notification.success({ message: "Thuộc tính đã được thêm vào phần biến thể" });
            },
        });
    };

    const updateTable = (forms) => {
        // Cập nhật cột
        const dynamicColumns = forms
            .filter((form) => form.name)
            .map((form) => ({
                title: form.name,
                dataIndex: form.name,
                align: "center",
            }));

        const updatedColumns = [
            ...dynamicColumns,
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
                    <Button danger onClick={() => handleDeleteRow(record.key)}>
                        Xóa
                    </Button>
                ),
            },
        ];
        setColumns(updatedColumns);

        // Cập nhật dữ liệu
        const variants = forms.reduce((acc, form) => {
            if (!form.values.length) return acc;
            return acc.flatMap((variant) =>
                form.values.map((value) => ({
                    ...variant,
                    [form.name]: value,
                    key: `${variant.key || ""}-${form.name}-${value}`,
                }))
            );
        }, [{}]);

        const uniqueVariants = [...new Map(variants.map((v) => [v.key, v])).values()];
        setTableData(uniqueVariants);
    };

    const handleAddValue = (formId) => {
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
                return { ...form, values: [...form.values, form.inputValue], inputValue: "" };
            }
            return form;
        });
        setForms(updatedForms);
        updateTable(updatedForms);
    };

    const handleDeleteTag = (formId, valueToDelete) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId) {
                return { ...form, values: form.values.filter((value) => value !== valueToDelete) };
            }
            return form;
        });
        setForms(updatedForms);
        updateTable(updatedForms);
    };

    const handleUpdateQuantity = (key, value) => {
        const updatedTableData = tableData.map((row) => {
            if (row.key === key) {
                return { ...row, quantity: value };
            }
            return row;
        });
        setTableData(updatedTableData);
    };

    const handleDeleteRow = (key) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Biến thể sau khi xóa sẽ không thể khôi phục",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                // Chỉ xóa dòng với key cụ thể
                const updatedTableData = tableData.filter((row) => row.key !== key);
                setTableData(updatedTableData);
            },
        });
    };    

    const handleAddVariantForm = () => {
        setForms([...forms, { id: Date.now(), name: "", values: [], inputValue: "" }]);
    };

    return (
        <div className="container">
            <h1 className="mb-5">Cập nhật sản phẩm</h1>
            <Form name="basic" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} labelAlign="top">
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
                            <Input className="input-item" />
                        </Form.Item>
                        <Form.Item label="Giá nhập" rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}>
                            <InputNumber className="input-item" />
                        </Form.Item>
                        <Form.Item label="Giá bán" rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}>
                            <InputNumber className="input-item" />
                        </Form.Item>
                        <Form.Item label="Danh mục" name="category">
                            <Select className="input-item">
                                <Option>Điện thoại</Option>
                                <Option>Máy tính</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={16} className="col-item">
                        <Form.Item label="Ảnh sản phẩm" valuePropName="fileList">
                            <Upload listType="picture-card" multiple>
                                <button className="upload-button" type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>
                            </Upload>
                        </Form.Item>
                        <Form.Item label="Mô tả sản phẩm" name="description">
                            <TextArea rows={8} className="input-item" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <hr />

            <h2>Thuộc tính</h2>
            <div className="attribute">
                <Input
                    placeholder="Nhập tên thuộc tính mới"
                    value={newAttribute}
                    onChange={(e) => setNewAttribute(e.target.value)}
                    className="input-attribute"
                />
                <Button className="btn-item" type="primary" onClick={handleAddAttribute}>
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
                                onChange={(value) => {
                                    if (forms.some((f) => f.name === value && f.id !== form.id)) {
                                        notification.error({ message: `Thuộc tính "${value}" đã được chọn trước đó` });
                                        return;
                                    }
                                    const updatedForms = forms.map((f) => (f.id === form.id ? { ...f, name: value } : f));
                                    setForms(updatedForms);
                                }}
                            >
                                {data && data.map((attr) => <Option key={attr.id} value={attr.name}>{attr.name}</Option>)}
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

                <Button color="primary" variant="dashed" onClick={handleAddVariantForm}>
                    Thêm biến thể
                </Button>
            </div>
            

            <hr />

            <h2>Danh sách sản phẩm cùng loại</h2>
            <Table columns={columns} dataSource={tableData} pagination={false} />

            <div className="add">
                <Button 
                    type="primary" 
                    size="large" 
                    htmlType="submit"
                >
                    Cập nhật
                </Button>
            </div>
        </div>
    );
};

export default Edit;
