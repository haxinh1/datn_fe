import React, { useState } from "react";
import { Button, Select, Table, InputNumber, notification, AutoComplete, Tooltip } from "antd";
import { useQuery } from "@tanstack/react-query";
import { productsServices } from "../../services/product";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Import = () => {
    const [selectedItem, setSelectedItem] = useState(null);
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
                    description: "Bạn đã chọn sản phẩm này, vui lòng kiểm tra lại.",
                });
                return;
            }
            
            setSelectedItem(option.item);
            setSearchQuery(option.item.name); // Hiển thị tên sản phẩm
        }
    };

    // Xử lý khi tìm kiếm sản phẩm
    const handleSearch = (value) => {
        setSearchQuery(value);
        setFilteredProducts(products.filter(product =>
            product.name.toLowerCase().includes(value.toLowerCase())
        ));
    };

    // Thêm sản phẩm/biến thể vào danh sách nhập hàng
    const handleAddVariant = () => {
        if (selectedItem) {
            if (selectedItem.variants && selectedItem.variants.length > 0) {
                // Nếu sản phẩm có biến thể
                const newVariants = selectedItem.variants.map(variant => ({
                    id: variant.id,
                    productId: selectedItem.id,
                    quantity: 1,
                    price: 0, // Giá nhập do người dùng nhập vào
                    sell_price: variant.sell_price || 0, // Giá bán lấy từ DB
                    total: 0, 
                    variantName: `${selectedItem.name} - ${variant.attribute_value_product_variants.map(attr => attr.attribute_value.value).join(" - ")}`, 
                }));
                setAddedVariants(prevVariants => [...prevVariants, ...newVariants]);
            } else {
                // Nếu là sản phẩm đơn
                setAddedVariants(prevVariants => [
                    ...prevVariants,
                    {
                        id: selectedItem.id,
                        productId: selectedItem.id,
                        quantity: 1,
                        price: 0, // Giá nhập do người dùng nhập vào
                        sell_price: selectedItem.sell_price || 0, // Giá bán lấy từ DB
                        total: 0,
                        variantName: selectedItem.name,
                    }
                ]);
            }
            setSearchQuery(""); // Reset input sau khi thêm sản phẩm
            setSelectedItem(null);
        }
    };

    // Cập nhật giá trị trong danh sách
    const updateItem = (id, field, value) => {
        setAddedVariants(prevItems =>
            prevItems.map(item => 
                item.id === id ? { 
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
                // Nếu là biến thể
                groupedProducts[item.productId].variants.push({
                    id: item.id,
                    price: item.price,
                    quantity: item.quantity
                });
            } else {
                // Nếu là sản phẩm đơn
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

    // Gửi dữ liệu nhập hàng
    const handleSubmit = async () => {
        const payload = preparePayload();
        console.log("Payload to submit:", JSON.stringify(payload, null, 2)); // Log dữ liệu trước khi gửi
    
        try {
            const response = await productsServices.importProduct(payload);
            notification.success({
                message: "Nhập hàng thành công!",
                description: "Sản phẩm đã được nhập vào kho.",
            });
            setAddedVariants([]);
        } catch (error) {
            console.error("Lỗi khi nhập hàng:", error.response?.data);
            notification.error({
                message: "Lỗi nhập hàng",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi nhập hàng.",
            });
        }
    };    

    // Cột dữ liệu cho bảng
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            align: "center",
        },
        {
            title: "Tên biến thể",
            dataIndex: "variantName",
            align: "center",
        },
        {
            title: "Giá nhập (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (text, record) => (
                <InputNumber
                    min={0}
                    value={record.price}
                    onChange={(value) => updateItem(record.id, "price", value)}
                />
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
                    onChange={(value) => updateItem(record.id, "quantity", value)}
                />
            ),
        },
        {
            title: "Thành tiền (VNĐ)", // Thành tiền = giá nhập * số lượng
            dataIndex: "total",
            align: "center",
            render: (_, record) => record.total.toLocaleString(),
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Tooltip title="Xóa biến thể">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(record.id)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">Nhập hàng</h1>

            <div className="attribute">
                <AutoComplete
                    className="input-item"
                    placeholder="Tìm kiếm sản phẩm"
                    value={searchQuery} // Hiển thị tên sản phẩm đã chọn
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

                <Button
                    type="primary"
                    className="btn-import"
                    icon={<PlusOutlined />}
                    onClick={handleAddVariant}
                    disabled={!selectedItem}
                >
                    Thêm vào danh sách
                </Button>

                <Link to="/creat">
                    <Button
                        className='btn-import'
                        color="primary"
                        variant="outlined"
                        icon={<PlusOutlined />}
                    >
                        Tạo mới
                    </Button>
                </Link>
            </div>

            <Table
                dataSource={addedVariants}
                columns={columns}
                rowKey="id"
                pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={4} align="right">
                            <strong>Tổng giá trị (VNĐ):</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                            <strong>{calculateTotalAmount().toLocaleString()}</strong>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />

            <div className="add">
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    className="btn-item"
                >
                    Hoàn thành nhập hàng
                </Button>
            </div>
        </div>
    );
};

export default Import;
