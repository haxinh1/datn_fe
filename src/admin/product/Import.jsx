import React, { useState } from "react";
import { Button, Select, Table, InputNumber, notification, AutoComplete, Tooltip, Form } from "antd";
import { useQuery } from "@tanstack/react-query";
import { productsServices } from "../../services/product";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Import = () => {
    const [form] = Form.useForm();
    const [addedVariants, setAddedVariants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Fetch danh sách sản phẩm và biến thể
    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
    });

    // Xử lý khi chọn sản phẩm
    const handleSelectProduct = (value, option) => {
        const selectedProduct = products.find(product => product.id === value);
    
        if (selectedProduct) {
            // Kiểm tra nếu sản phẩm đã có trong danh sách nhập hàng
            const isAlreadyAdded = addedVariants.some(item => item.productId === selectedProduct.id);
            
            if (isAlreadyAdded) {
                notification.warning({
                    message: "Sản phẩm đã có trong danh sách",
                    description: `Sản phẩm "${selectedProduct.name}" đã được chọn trước đó.`,
                });
                return; // Không thêm sản phẩm bị trùng
            }
    
            const newVariants = selectedProduct.variants?.length 
                ? selectedProduct.variants.map(variant => ({
                    id: variant.id,
                    productId: selectedProduct.id,
                    quantity: 1,
                    price: 0, 
                    sell_price: variant.sell_price || 0,
                    total: 0, 
                    variantName: `${selectedProduct.name} - ${variant.attribute_value_product_variants.map(attr => attr.attribute_value.value).join(" - ")}`,
                }))
                : [{
                    id: selectedProduct.id,
                    productId: selectedProduct.id,
                    quantity: 1,
                    price: 0, 
                    sell_price: selectedProduct.sell_price || 0,
                    total: 0,
                    variantName: selectedProduct.name,
                }];
    
            setAddedVariants(prevVariants => [...prevVariants, ...newVariants]); // Thêm vào bảng luôn
            setSearchQuery(""); // Reset input tìm kiếm
        }
    };    

    // Xử lý khi tìm kiếm sản phẩm
    const handleSearch = (value) => {
        setSearchQuery(value);
        setFilteredProducts(products.filter(product =>
            product.name.toLowerCase().includes(value.toLowerCase())
        ));
    };

    // Cập nhật giá trị trong danh sách
    const updateItem = (id, productId, field, value) => {
        setAddedVariants(prevItems =>
            prevItems.map(item => 
                (item.id === id && item.productId === productId) ? 
                { 
                    ...item, 
                    [field]: value, 
                    total: (field === "price" ? value : item.price) * item.quantity 
                } : item
            )
        );
    };    

    // Xóa sản phẩm khỏi danh sách
    const removeItem = (id) => {
        setAddedVariants(prevItems => prevItems.filter(item => item.id !== id));
    };

    // Tính tổng giá trị nhập hàng
    const calculateTotalAmount = () => {
        return addedVariants.reduce((total, item) => total + item.quantity * item.price, 0);
    };

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Chuẩn bị dữ liệu nhập hàng
    const preparePayload = () => {
        const groupedProducts = {};
    
        addedVariants.forEach(item => {
            if (!groupedProducts[item.productId]) {
                groupedProducts[item.productId] = {
                    id: item.productId,
                    variants: []
                };
            }
    
            if (item.variantName.includes("-")) {
                // Nếu là biến thể, thêm vào danh sách variants
                groupedProducts[item.productId].variants.push({
                    id: item.id,
                    price: item.price,
                    quantity: item.quantity
                });
            } else {
                // Nếu là sản phẩm đơn, lưu trực tiếp
                groupedProducts[item.productId] = {
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity
                };
            }
        });
    
        const productsArray = Object.values(groupedProducts);
    
        const payload = {
            user_id: 1,
            products: productsArray
        };
    
        console.log("Payload to submit:", JSON.stringify(payload, null, 2));
        return payload;
    };    

    const handleValuesChange = (changedValues) => {
        setAddedVariants(prevVariants =>
            prevVariants.map(item => {
                const newValue = changedValues[`price_${item.id}`];
                if (newValue !== undefined) {
                    return { ...item, price: newValue, total: newValue * item.quantity };
                }
                return item;
            })
        );
    
        // Cập nhật giá vào form để tránh lỗi khi submit
        form.setFieldsValue(changedValues);
    };    

    // Gửi dữ liệu nhập hàng
    const handleSubmit = async () => {
        try {
            await form.validateFields(); // Kiểm tra form trước khi submit
    
            const payload = preparePayload(); // Lấy dữ liệu đúng format
    
            if (!payload.products.length) {
                notification.error({
                    message: "Lỗi nhập hàng",
                    description: "Không có sản phẩm nào được chọn!",
                });
                return;
            }
    
            console.log("Final Payload:", JSON.stringify(payload, null, 2));
    
            const response = await productsServices.importProduct(payload);
            notification.success({
                message: "Nhập hàng thành công!",
                description: "Sản phẩm đã được nhập vào kho.",
            });
    
            setAddedVariants([]); // Reset danh sách sản phẩm sau khi nhập hàng thành công
            form.resetFields();
        } catch (error) {
            console.error("Lỗi khi nhập hàng:", error);
        }
    };           

    return (
        <div>
            <h1 className="mb-5">Nhập hàng</h1>

            <div className="attribute">
                <AutoComplete
                    className="input-item"
                    placeholder="Tìm kiếm sản phẩm"
                    value={searchQuery}
                    onSearch={handleSearch}
                    onSelect={(value, option) => handleSelectProduct(value, option)}
                >
                    {filteredProducts.map(product => (
                        <AutoComplete.Option key={product.id} value={product.id} item={product}>
                            <div className="select-option-item">
                                <img src={product.thumbnail} className="product-thumbnail" alt={product.name} />
                                <span>{product.name}</span>
                            </div>
                        </AutoComplete.Option>
                    ))}
                </AutoComplete>

                <Link to="/creat">
                    <Button
                        className='btn-import'
                        type="primary"
                        icon={<PlusOutlined />}
                    >
                        Tạo mới
                    </Button>
                </Link>
            </div>

            <Form 
                form={form} 
                layout="vertical"
                onValuesChange={handleValuesChange}
            >
                <Table
                    dataSource={addedVariants}
                    rowKey="id"
                    pagination={false}
                    columns={[
                        {
                            title: "STT",
                            dataIndex: "index",
                            render: (_, __, index) => index + 1,
                            align: "center",
                        },
                        {
                            title: "Tên sản phẩm",
                            dataIndex: "variantName",
                            align: "center",
                        },
                        {
                            title: "Giá nhập (VNĐ)",
                            dataIndex: "price",
                            align: "center",
                            render: (_, record) => (
                                <Form.Item
                                    name={`price_${record.id}`}
                                    initialValue={record.price}
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập giá nhập!",
                                        },
                                        {
                                            type: "number",
                                            min: 1,
                                            message: "Giá nhập phải lớn hơn 0!",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (value === undefined || value === null) {
                                                    return Promise.reject("Vui lòng nhập giá nhập!");
                                                }
                                                if (value >= record.sell_price) {
                                                    return Promise.reject("Giá nhập phải nhỏ hơn giá bán!");
                                                }
                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    <InputNumber
                                        min={1}
                                        formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                                        parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                                        onChange={(value) => {
                                            form.setFieldsValue({ [`price_${record.id}`]: value }); // Cập nhật giá vào form
                                            updateItem(record.id, record.productId, "price", value); // Cập nhật giá vào danh sách
                                        }}
                                    />
                                </Form.Item>
                            ),
                        },                        
                        {
                            title: "Giá bán (VNĐ)", // Hiển thị giá bán từ DB
                            dataIndex: "sell_price",
                            align: "center",
                            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
                        },
                        {
                            title: "Số lượng",
                            dataIndex: "quantity",
                            align: "center",
                            render: (text, record) => (
                                <InputNumber
                                    min={1}
                                    value={record.quantity}
                                    onChange={(value) => updateItem(record.id, record.productId, "quantity", value)}
                                />
                            ),
                        },
                        {
                            title: "Thành tiền (VNĐ)",
                            dataIndex: "total",
                            align: "center",
                            render: (_, record) => record.total.toLocaleString(),
                        },
                        {
                            title: "Thao tác",
                            key: "action",
                            align: "center",
                            render: (_, record) => (
                                <Tooltip title="Xóa sản phẩm">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeItem(record.id)}
                                    />
                                </Tooltip>
                            ),
                        },
                    ]}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={3} align="right">
                                <strong>Tổng giá trị (VNĐ):</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="center">
                                <strong>{calculateTotalAmount().toLocaleString()}</strong>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
                <div className="add">
                    <Button type="primary" onClick={handleSubmit} className="btn-item">
                        Hoàn thành nhập hàng
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Import;