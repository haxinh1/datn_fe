import { Button, Table, Modal, Row } from 'antd';
import React, { useState } from 'react';
import { productsServices } from '../../services/product';
import { useQuery } from '@tanstack/react-query';
import { BookOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const History = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);

    // Fetch danh sách đơn nhập hàng
    const { data: stocks, isLoading: isProductsLoading } = useQuery({
        queryKey: ["stocks"],
        queryFn: async () => {
            const response = await productsServices.history();
            return response.data;
        },
    });

    const { data: products } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
    });

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Xử lý khi bấm vào nút "Chi tiết"
    const handleShowDetails = (record) => {
        setSelectedStock(record);
        setIsModalVisible(true);
    };

    // Cột danh sách nhập hàng
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            render: (_, __, index) => index + 1,
            align: "center",
        },
        {
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
            align: "center",
        },
        {
            title: "Người nhập hàng",
            dataIndex: "created_by", 
            key: "created_by",
            align: "center",
        },
        {
            title: "Ngày nhập hàng",
            dataIndex: "ngaytao",
            key: "ngaytao",
            render: (ngaytao) => (ngaytao ? dayjs(ngaytao).format("DD-MM-YYYY") : ""),
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Button
                    className="action-link action-link-blue"
                    type="link"
                    onClick={() => handleShowDetails(record)}
                >
                    Chi tiết
                </Button>
            ),
        }
    ];

    // Xử lý dữ liệu cho bảng modal (Chi tiết đơn nhập hàng)
    const getModalDataSource = () => {
        if (!selectedStock) return [];

        let index = 1;
        return selectedStock.products.flatMap(product => {
            // Lấy thông tin đầy đủ của sản phẩm từ API products
            const fullProduct = products?.find(p => p.id === product.id);
            if (!fullProduct) return [];

            return (product.variants && product.variants.length > 0)
                ? product.variants.map(variant => {
                    // Tìm biến thể đầy đủ trong fullProduct
                    const fullVariant = fullProduct.variants?.find(v => v.id === variant.id);
                    if (!fullVariant) return null;

                    // Lấy danh sách thuộc tính của biến thể
                    const attributes = fullVariant.attribute_value_product_variants
                        ?.map(attr => attr.attribute_value?.value)
                        .join(" - ") || "Không có thuộc tính";

                    return {
                        key: index++,  // Đánh số thứ tự đúng
                        name: `${product.name} - ${attributes}`, // Gộp tên sản phẩm với thuộc tính
                        price: variant.price,
                        quantity: variant.quantity,
                        total: variant.price * variant.quantity,  // ✅ Tính tổng tiền
                    };
                }).filter(Boolean) // Lọc bỏ null nếu không tìm thấy dữ liệu
                : [{
                    key: index++,  // Đánh số thứ tự đúng
                    name: product.name, // Sản phẩm không có biến thể
                    price: product.price,
                    quantity: product.quantity,
                    total: product.price * product.quantity,  // ✅ Tính tổng tiền
                }];
        });
    };

    // Cột chi tiết đơn nhập hàng
    const detailColumns = [
        {
            title: "STT",
            dataIndex: "key", // Sử dụng key đã gán trong getModalDataSource()
            align: "center",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            align: "center",
        },
        {
            title: "Giá nhập (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Tổng tiền (VNĐ)",  // ✅ Thêm cột tổng tiền
            dataIndex: "total",
            align: "center",
            render: (total) => (total ? formatPrice(total) : ""),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <BookOutlined style={{ marginRight: "8px" }} />
                Lịch sử nhập hàng
            </h1>
            <Table 
                columns={columns} 
                dataSource={stocks} 
                rowKey="id"
                loading={isProductsLoading} 
                pagination={false} 
                bordered 
            />

            {/* Modal hiển thị chi tiết đơn nhập hàng */}
            <Modal
                title="Chi tiết đơn nhập hàng"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    columns={detailColumns}
                    dataSource={getModalDataSource()}                
                    rowKey="key"  // Đảm bảo mỗi hàng có key duy nhất
                    pagination={false}
                    bordered
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={4} align="right">
                                <strong>Tổng giá trị (VNĐ):</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align="center">
                                <strong>{selectedStock ? formatPrice(selectedStock.total_amount) : ""}</strong>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
            </Modal>
        </div>
    );
};

export default History;
