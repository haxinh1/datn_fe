import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, InputNumber, Form, notification, Row, Col, Upload, Radio } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";
import "./add.css";
import { productsServices } from './../../services/product';
import { BrandsServices } from './../../services/brands';
import { categoryServices } from './../../services/categories';
import { AttributesServices } from './../../services/attributes';
import { ValuesServices } from './../../services/attribute_value';
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const Add = () => {
    const queryClient = useQueryClient(); 
    const [forms, setForms] = useState([{ id: Date.now(), name: "", values: [] }]);
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [valueForm] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null);
    const [productType, setProductType] = useState("single");
    const [selectedAttributeId, setSelectedAttributeId] = useState(null);
    const [filteredValues, setFilteredValues] = useState([]); // Lưu giá trị thuộc tính được lọc
    const [tableData, setTableData] = useState([]); // Dữ liệu bảng
    const navigate = useNavigate()

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
    
    // slug tạo tự động
    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setFieldsValue({
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
        });
    };

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
        const productData = prepareProductData(values);
    
        const finalData = {
            ...productData,
            thumbnail, // Thêm link ảnh đã upload
            sell_price: values.sell_price, // Giá bán
            slug: values.slug, // Slug
            category: values.category, // Danh mục
            brand_id: values.brand_id, // Thương hiệu
            name_link: values.name_link, // Link
        };
    
        console.log("Dữ liệu gửi đi:", finalData); // Log để kiểm tra
        mutate(finalData); // Gửi dữ liệu tới API
    };            

    // Fetch danh sách thương hiệu
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await BrandsServices.fetchBrands();
            return response.data;
        }
    });

    // danh sách danh mục
    const [categories, setCategories] = useState([]);
    const fetchData = async () => {
        const response = await categoryServices.fetchCategories()
        setCategories(response)
    }
    useEffect(() => {
        fetchData()
    }, [])

    // danh sách thuộc tính
    const { data: attributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await AttributesServices.fetchAttributes();
            return response.data;
        },
    });

    // tạo thuộc tính mới
    const createAttribute = useMutation({
        mutationFn: async (attribute) => {
            return await AttributesServices.createAttribute(attribute);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            form.resetFields();
            setIsAttributeModalOpen(false);
            notification.success({
                message: "Thêm thuộc tính thành công!",
            });
        },
        onError: (error) => {
            notification.error({
                message: "Thêm thuộc tính thất bại!",
                description: error.response?.data?.message || error.message,
            });
        },
    });
    const handleAddAttribute = (values) => {
        createAttribute.mutate(values);
    };

    // danh sách giá trị thuộc tính
    const { data: attributeValue } = useQuery({
        queryKey: ["attributeValue"],
        queryFn: async () => {
            const response = await ValuesServices.fetchValues();
            return response.data;
        },
    });

    // tạo giá trị thuộc tính mới
    const createAttributeVlue = useMutation({
        mutationFn: async (attributeValue) => {
            return await ValuesServices.createValue(attributeValue); // Truyền đúng tham số
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributeValue"]);
            form.resetFields();
            setIsValueModalOpen(false);
            notification.success({
                message: "Thêm giá trị thuộc tính thành công!",
            });
        },
        onError: (error) => {
            notification.error({
                message: "Thêm giá trị thuộc tính thất bại!",
                description: error.response?.data?.message || error.message,
            });
        },
    });
    
    const handleAddValue = (values) => {
        createAttributeVlue.mutate({
            value: values.value,
            attribute_id: values.attribute_id, // Gửi attribute_id
        });
    };    

    // hiển thị biến thể ở bảng
    const generateVariants = () => {
        const variants = [];
    
        const attributesWithValues = forms.filter((form) => form.name && form.values.length > 0);
    
        if (attributesWithValues.length === 0) {
            notification.warning({
                message: "Chưa chọn giá trị",
                description: "Vui lòng chọn thuộc tính và giá trị trước khi tạo biến thể.",
            });
            return;
        }
    
        const generateCombinations = (index, currentVariant) => {
            if (index === attributesWithValues.length) {
                variants.push({ ...currentVariant });
                return;
            }
    
            const attribute = attributesWithValues[index];
            attribute.values.forEach((value) => {
                if (value && value.id !== null && value.id !== undefined) {
                    generateCombinations(index + 1, {
                        ...currentVariant,
                        [attribute.name]: { id: value.id, value: value.value }, // Thêm cả id và value
                    });
                }
            });
        };
    
        generateCombinations(0, {});
    
        setTableData(variants); // Cập nhật tableData
    };                         

    const prepareProductData = (formValues) => {
        // Lấy tất cả các giá trị thuộc tính được chọn
        const attributeValuesId = forms.flatMap((form) =>
            form.values
                .filter((value) => value && value.id !== null && value.id !== undefined) // Lọc giá trị hợp lệ
                .map((value) => Number(value.id)) // Ép kiểu sang number
        );
    
        // Tạo tất cả các tổ hợp biến thể
        const attributeCombinations = [];
        const generateCombinations = (index, currentCombination) => {
            if (index === forms.length) {
                attributeCombinations.push([...currentCombination]);
                return;
            }
    
            forms[index].values.forEach((value) => {
                if (value && value.id !== null && value.id !== undefined) {
                    generateCombinations(index + 1, [...currentCombination, Number(value.id)]);
                }
            });
        };
    
        generateCombinations(0, []);
    
        // Cấu trúc dữ liệu sản phẩm
        return {
            name: formValues.name,
            attribute_values_id: attributeValuesId, // Danh sách id dạng number
            product_variants: attributeCombinations.map((combination) => ({
                attribute_values: combination, // Các tổ hợp id dạng number
            })),
        };
    }; 

    // bảng biến thể
    const columns = [
        ...forms.map((form) => ({
            title: form.name, // Tên cột là tên thuộc tính
            dataIndex: form.name,
            key: form.name,
            align: "center",
            render: (_, record) => {
                // Hiển thị value nếu tồn tại
                const attributeValue = record[form.name];
                return attributeValue?.value || "N/A"; // Lấy giá trị value, nếu không có thì "N/A"
            },
        })),
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, record) => <InputNumber min={0} />,
            align: "center",
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                        setTableData(tableData.filter((item) => item !== record)); // Xóa dòng
                    }}
                />
            ),
        },
    ];    

    return (
        <div className="container">
            <h1 className="mb-5">Thêm sản phẩm mới</h1>
            <Form 
                form={form} 
                onFinish={onFinish}
                name="basic"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                labelAlign="top"
            >
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                            name="name"
                        >
                            <Input className="input-item" onChange={handleNameChange} />
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
                            name="brand_id"
                            rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
                        >
                            <Select 
                                className="input-item"
                                placeholder="Chọn thương hiệu"
                                showSearch
                            >
                                {brands && brands.map((brand) => (
                                    <Option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item 
                            label="Danh mục" 
                            name="category"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                        >
                            <Select
                                className="input-item"
                                placeholder="Chọn danh mục"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {categories.flatMap((category) =>
                                    category.children
                                    .filter((child) => child.parent_id !== null) // Lọc các mục con có parent_id khác null
                                    .map((child) => (
                                        <Option key={child.id} value={child.name}>
                                            {child.name}
                                        </Option>
                                    ))
                                )}
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
                                data={{ upload_preset: "quangOsuy" }}
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
                        <h2>Quản lý Thuộc tính & Biến thể</h2>
                        {forms.map((form, index) => (
                            <div key={form.id} className="attribute">
                                <Select
                                    className="input-attribute"
                                    allowClear
                                    showSearch
                                    placeholder="Chọn thuộc tính"
                                    value={form.name || undefined}
                                    onChange={(value) => {
                                        if (value === "create_attribute") {
                                            setIsAttributeModalOpen(true);
                                        } else {
                                            forms[index].name = value;
                                            setForms([...forms]);
                                            const selectedAttribute = attributes.find(attr => attr.name === value);
                                            const valuesForAttribute = attributeValue.filter(
                                                val => val.attribute_id === selectedAttribute.id
                                            );
                                            setFilteredValues(valuesForAttribute);
                                        }
                                    }}
                                >
                                    {attributes && attributes.map((attr) => (
                                        <Option key={attr.id} value={attr.name}>
                                            {attr.name}
                                        </Option>
                                    ))}
                                    <Option value="create_attribute" style={{ color: "blue" }}>
                                        + Tạo thuộc tính mới
                                    </Option>
                                </Select>

                                <Select
                                    mode="multiple"
                                    className="input-attribute"
                                    allowClear
                                    placeholder="Chọn giá trị"
                                    onChange={(values) => {
                                        if (values.includes("create_value")) {
                                            // Người dùng chọn "Tạo giá trị mới"
                                            setIsValueModalOpen(true);
                                            const filteredValues = values.filter((value) => value !== "create_value");
                                            forms[index].values = filteredValues.map((value) => ({
                                                id: Number(value),
                                                value: filteredValues.find((val) => val.id === Number(value))?.value || "", // Lấy giá trị value
                                            }));
                                        } else {
                                            forms[index].values = values.map((value) => ({
                                                id: Number(value),
                                                value: filteredValues.find((val) => val.id === Number(value))?.value || "", // Lấy giá trị value
                                            }));
                                        }
                                        setForms([...forms]); // Cập nhật forms
                                    }}
                                >
                                    {filteredValues.map((val) => (
                                        <Option key={val.id} value={val.id}>
                                            {val.value}
                                        </Option>
                                    ))}
                                    <Option value="create_value" style={{ color: "blue" }}>
                                        + Tạo giá trị mới
                                    </Option>
                                </Select>
                            </div>
                        ))}

                        <Button className="btn-item" onClick={() => setForms([...forms, { id: Date.now(), name: "", values: [] }])}>
                            Thêm thuộc tính
                        </Button>
                        <Button type="primary" className="btn-item" onClick={generateVariants}>Tạo biến thể</Button>

                        <hr />
                        <Table columns={columns} dataSource={tableData} rowKey="id" />
                    </>
                )}

                <Modal
                    title="Tạo thuộc tính mới"
                    visible={isAttributeModalOpen}
                    onCancel={() => setIsAttributeModalOpen(false)}
                    footer={null}
                >
                    <Form
                        form={valueForm}
                        onFinish={(values) => handleAddAttribute(values)}
                        layout="vertical"
                    >
                        <Form.Item
                            label="Tên thuộc tính"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính!" }]}
                        >
                            <Input placeholder="Nhập tên thuộc tính" className="input-item" />
                        </Form.Item>
                        <div className="add">
                            <Button type="primary" htmlType="submit">
                                Tạo
                            </Button>
                        </div>
                    </Form>
                </Modal>

                <Modal
                    title="Tạo giá trị thuộc tính mới"
                    visible={isValueModalOpen}
                    onCancel={() => setIsValueModalOpen(false)}
                    footer={null}
                >
                    <Form
                        form={valueForm}
                        layout="vertical"
                        onFinish={(values) => handleAddValue(values)}                    
                    >
                        <Form.Item
                            label="Tên giá trị"
                            name="value"
                            rules={[{ required: true, message: "Vui lòng nhập tên giá trị!" }]}
                        >
                            <Input placeholder="Nhập tên giá trị" className="input-item" />
                        </Form.Item>

                        <Form.Item
                            label="Thuộc tính"
                            name="attribute_id"
                            rules={[{ required: true, message: "Vui lòng chọn thuộc tính!" }]}
                        >
                            <Select
                                className="input-attribute"
                                allowClear
                                placeholder="Chọn thuộc tính"
                                onChange={(value) => setSelectedAttributeId(value)}
                            >
                                {attributes && attributes.map((attr) => (
                                    <Option key={attr.id} value={attr.id}>
                                        {attr.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <div className="add">
                            <Button type="primary" htmlType="submit">
                                Tạo
                            </Button>
                        </div>
                    </Form>
                </Modal>

                <div className="add">
                    <Button htmlType="submit" type="primary" className="btn-item">
                        Thêm sản phẩm
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Add;
