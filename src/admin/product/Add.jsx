import React, { useState } from "react";
import { Button, Form, Input, InputNumber, Select, Upload, Row, Col, Modal, notification, Radio, Tag, Table } from "antd";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AttributesServices } from './../../services/attributes';
import { productsServices } from './../../services/product';
import axios from "axios";
import "./add.css";

const { Option } = Select;

const Add = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null);
    const [newAttribute, setNewAttribute] = useState({ name: "" });
    const [forms, setForms] = useState([]);
    const [variants, setVariants] = useState([]);
    const [productType, setProductType] = useState("single"); 

    // Thêm sản phẩm
    const { mutate } = useMutation({
        mutationFn: async (product) => {
            try {
                const response = await productsServices.createProduct(product);
                return response
            } catch (error) {
                throw new Error(error.response?.data?.message || "Đã xảy ra lỗi khi thêm sản phẩm.");
            }
        },
        onError: (error) => {
            notification.error({
                message: "Thêm sản phẩm thất bại",
                description: error.message,
            });
        },
        onSuccess: () => {
            form.resetFields();
            notification.success({
                message: "Thêm sản phẩm thành công!",
                description: "Sản phẩm mới đã được thêm vào danh sách.",
            });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            navigate("/list-pr");
        },
    });
    
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            setThumbnail(info.file.response.secure_url);
        } 
    };
    
    const onFinish = (values) => {
        mutate({ ...values, thumbnail });
    };

    // Fetch danh sách thương hiệu
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/brands`);
            return response.data.data;
        }
    });

    // Lấy danh sách thuộc tính
    const { data: attributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/attributes`);
            return response.data.data;
        },
    });

    // Mutation để thêm mới thuộc tính
    const { mutate: mutateAttr } = useMutation({
        mutationFn: async (attribute) => {
            return await AttributesServices.createAttribute(attribute); // Gọi service để thêm thuộc tính
        },
        onSuccess: () => {
            setNewAttribute({ name: "" }); // Reset form sau khi thêm thành công
            notification.success({ message: "Thêm thuộc tính thành công" }); // Thông báo thành công
            queryClient.invalidateQueries(["attributes"]); // Làm mới danh sách thuộc tính
        },
        onError: (error) => {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Đã xảy ra lỗi không xác định.";
            notification.error({
                message: "Thêm thuộc tính thất bại",
                description: errorMessage,
            });
        },
    });

    // Xử lý khi nhập liệu
    const onChange = (e) => {
        const { name, value } = e.target;
        setNewAttribute({
            ...newAttribute,
            [name]: value,
        });
    };

    // Xử lý khi gửi form
    const handleAddAttribute = () => {
        if (!newAttribute.name.trim()) {
            notification.error({ message: "Tên thuộc tính không được để trống!" });
            return;
        }
        mutateAttr(newAttribute); // Gọi mutation để thêm thuộc tính
    };

    // Thêm giá trị vào thuộc tính
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
        generateVariants(updatedForms); // Cập nhật biến thể
    };

    // Xóa giá trị khỏi thuộc tính
    const handleDeleteTag = (formId, valueToDelete) => {
        const updatedForms = forms.map((form) => {
            if (form.id === formId) {
                return { ...form, values: form.values.filter((value) => value !== valueToDelete) };
            }
            return form;
        });
        setForms(updatedForms);
        generateVariants(updatedForms); // Cập nhật biến thể
    };

    // Thêm form biến thể
    const handleAddVariantForm = () => {
        setForms([...forms, { id: Date.now(), name: "", values: [], inputValue: "" }]);
    };

    // cột bảng động
    const generateVariants = (forms) => {
        if (forms.length === 0 || forms.some((form) => !form.name || form.values.length === 0)) {
            setVariants([]);
            return;
        }

        // Tạo tất cả các tổ hợp giá trị
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
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Biến thể sau khi xóa sẽ không thể khôi phục",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                const updatedVariants = variants.filter((variant) => variant.key !== variantKey);
                setVariants(updatedVariants);
            },
        });
    };

    // bảng biến thể
    const columns = [
        ...(forms.map((form) => ({
            title: form.name,
            dataIndex: form.name,
            key: form.name,
            align: "center",
        }))),
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => <InputNumber min={0} />,
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
        <div className="container">
            <h1 className="mb-5">Thêm sản phẩm mới</h1>
            <Form 
                name="basic" 
                labelCol={{ span: 24 }} 
                wrapperCol={{ span: 24 }} 
                labelAlign="top"
                form={form}
                onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item 
                            label="Tên sản phẩm" 
                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                            name="name"
                        >
                            <Input className="input-item" />
                        </Form.Item>

                        <Form.Item 
                            label="Giá bán" 
                            rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                            name="sell_price"
                        >
                            <InputNumber className="input-item" />
                        </Form.Item>

                        <Form.Item 
                            label="Slug" 
                            rules={[{ required: true, message: "Vui lòng nhập Slug" }]}
                            name="slug"
                        >
                            <Input className="input-item" />
                        </Form.Item>

                        <Form.Item 
                            label="Link" 
                            rules={[{ required: true, message: "Vui lòng nhập link" }]}
                            name="name_link"
                        >
                            <Input className="input-item" />
                        </Form.Item>

                        <Form.Item 
                            label="Thương hiệu sản phẩm" 
                            name="brands"
                            rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
                        >
                            <Select className="input-item">
                                {brands && brands.map((brand) => (
                                    <Option key={brand.id} value={brand.name}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Danh mục" name="category">
                            <Select className="input-item">
                                <Option>Áo</Option>
                                <Option>Quần</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col span={16} className="col-item">
                        <Form.Item 
                            label="Ảnh sản phẩm" 
                            name='thumbnail'
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[
                                {
                                    validator: (_, value) =>
                                    thumbnail ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh sản phẩm"),
                                },
                            ]}
                        >
                            <Upload 
                                listType="picture-card" 
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{upload_preset: "quangOsuy"}}
                                onChange={onHandleChange}
                            >
                                <button className="upload-button" type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </button>
                            </Upload>
                        </Form.Item>

                        <Form.Item 
                            label="Mô tả sản phẩm" 
                            name="content"
                        >
                            <TextArea rows={8} className="input-item" />
                        </Form.Item>

                        <Form.Item label="Loại sản phẩm">
                            <Radio.Group
                                className="radio-group"
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                options={[
                                    { label: "Sản phẩm đơn", value: "single" },
                                    { label: "Sản phẩm có biến thể", value: "variant" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {productType === "variant" && (
                    <>
                        <hr />
                        <h2>Thuộc tính</h2>
                        <div className="attribute">
                            <Input
                                name="name" // Đặt tên key cho input
                                placeholder="Nhập tên thuộc tính mới"
                                value={newAttribute.name} // Lấy giá trị từ state
                                onChange={onChange} // Gọi hàm xử lý khi thay đổi
                                className="input-attribute"
                            />
                            <Button
                                className="btn-item"
                                type="primary"
                                onClick={handleAddAttribute}
                            >
                                Tạo thuộc tính
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
                                        onChange={(value) => {
                                            if (forms.some((f) => f.name === value && f.id !== form.id)) {
                                                notification.error({ message: `Thuộc tính \"${value}\" đã được chọn trước đó` });
                                                return;
                                            }
                                            const updatedForms = forms.map((f) =>
                                                f.id === form.id ? { ...f, name: value } : f
                                            );
                                            setForms(updatedForms);
                                        }}
                                    >
                                        {attributes && attributes.map((attr) => (
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

                        <hr />
                        <h2>Danh sách hàng hóa cùng loại</h2>
                        <Table dataSource={variants} columns={columns} pagination={false} />
                    </>
                )}

                <div className="add">
                    <Button type="primary" size="large" htmlType="submit">
                        Thêm sản phẩm
                    </Button>
                </div>
            </Form>    
        </div>
    );
};

export default Add;