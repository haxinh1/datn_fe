import React, { useState } from 'react';
import { Select, Table, InputNumber, Button, notification } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { productsServices } from '../../services/product';
import "./add.css";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Import = () => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    // Fetch danh sách sản phẩm
    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
    });

    // Xử lý khi chọn sản phẩm hoặc biến thể
    const handleSelectChange = (value, option) => {
        setSelectedOption(option.itemData);
    };

    // Xử lý khi click "Thêm vào danh sách"
    const handleAddProduct = () => {
        if (!selectedOption) return;

        // Kiểm tra nếu sản phẩm đã tồn tại trong danh sách
        if (selectedItems.some(item => item.key === selectedOption.id)) {
            notification.warning({
                message: 'Sản phẩm này đã được thêm trước đó.',
            });
            return;
        }

        // Tạo tên đầy đủ cho sản phẩm/biến thể
        const fullName = selectedOption.variant
            ? `${selectedOption.name} - ${selectedOption.variant.attribute_value_product_variants?.map(attr => attr.attribute_value?.value).join(' - ')}`
            : selectedOption.name;

        setSelectedItems([...selectedItems, {
            ...selectedOption,
            key: selectedOption.id,
            name: fullName,
            quantity: 1,
            price: selectedOption.price || 0,
            sell_price: selectedOption.sell_price || 0,
        }]);

        // Reset trạng thái chọn
        setSelectedOption(null);
    };

    // Cập nhật giá trị trong danh sách
    const updateItem = (key, field, value) => {
        setSelectedItems(prevItems =>
            prevItems.map(item => (item.key === key ? { ...item, [field]: value } : item))
        );
    };

    // Xóa sản phẩm khỏi danh sách
    const removeItem = (key) => {
        setSelectedItems(prevItems => prevItems.filter(item => item.key !== key));
    };

    // Tính tổng giá trị thành tiền
    const calculateTotalAmount = () => {
        return selectedItems.reduce((total, item) => total + item.quantity * item.price, 0);
    };

    // Cột dữ liệu cho bảng
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            render: (_, __, index) => index + 1,
            align: 'center',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            align: 'center',
            width: 350,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    min={1}
                    value={record.quantity}
                    onChange={(value) => updateItem(record.key, 'quantity', value)}
                />
            ),
        },
        {
            title: 'Giá nhập (VNĐ)',
            dataIndex: 'price',
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    min={0}
                    value={record.price}
                    onChange={(value) => updateItem(record.key, 'price', value)}
                />
            ),
        },
        {
            title: 'Giá bán (VNĐ)',
            dataIndex: 'sell_price',
            align: 'center',
            render: (text, record) => (
                <InputNumber
                    min={0}
                    value={record.sell_price}
                    onChange={(value) => updateItem(record.key, 'sell_price', value)}
                />
            ),
        },
        {
            title: 'Thành tiền (VNĐ)',
            dataIndex: 'total',
            align: 'center',
            render: (_, record) => {
                const total = record.quantity * record.price;
                return total > 0 ? total.toLocaleString() : '0';
            },
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            width: 160,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(record.key)}
                />
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">Nhập hàng</h1>
            <div className='attribute'>
                <Select
                    className='input-item'
                    showSearch
                    allowClear
                    optionLabelProp="label"
                    placeholder="Tìm sản phẩm hoặc biến thể"
                    onChange={handleSelectChange}
                    value={selectedOption?.id}
                >
                    {products.flatMap(product => [
                        <Select.Option key={product.id} value={product.id} label={product.name} itemData={product}>
                            <div className="select-option-item">
                                <img src={product.thumbnail} className="product-thumbnail" alt={product.name} />
                                <span>{product.name}</span>
                            </div>
                        </Select.Option>,
                        ...product.variants?.map(variant => (
                            <Select.Option key={variant.id} value={variant.id} label={`${product.name} - ${variant.attribute_value_product_variants?.map(attr => attr.attribute_value?.value).join(' - ')}`} itemData={{ ...variant, name: product.name, variant }}>
                                <div className="select-option-item">
                                    <img src={variant.thumbnail} className="product-thumbnail" alt={product.name} />
                                    <span>{`${product.name} - ${variant.attribute_value_product_variants?.map(attr => attr.attribute_value?.value).join(' - ')}`}</span>
                                </div>
                            </Select.Option>
                        ))
                    ])}
                </Select>
                <Button
                    type="primary"
                    className='btn-import'
                    icon={<PlusOutlined />}
                    onClick={handleAddProduct}
                    disabled={!selectedOption}
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
                dataSource={selectedItems}
                columns={columns}
                rowKey="key"
                pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={5} align="right">
                            <strong>Tổng giá trị (VNĐ):</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                            <strong>{calculateTotalAmount().toLocaleString()}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell />
                    </Table.Summary.Row>
                )}
            />

            <div className="add">
                <Button htmlType="submit" type="primary" className="btn-item">
                    Hoàn thành
                </Button>
            </div>
        </div>
    );
};

export default Import;
