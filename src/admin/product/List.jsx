import React, { useState, useEffect } from "react";
import { Button, Image, Skeleton, Table, Select } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import "./list.css";
import { productsServices } from "../../services/product";
import { BrandsServices } from "../../services/brands";
import { categoryServices } from "../../services/categories";

const List = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);

    // Fetch danh sách sản phẩm bao gồm biến thể
    const { data: products, isLoading: isProductsLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
    });

    // Fetch danh sách thương hiệu
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await BrandsServices.fetchBrands();
            return response.data;
        },
    });

    // Lấy danh sách danh mục
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            const response = await categoryServices.fetchCategories();
            setCategories(response);
        };
        fetchCategories();
    }, []);

    // Lọc sản phẩm theo thương hiệu và danh mục
    const filteredProducts = products?.filter((product) => {
        const matchesBrand = selectedBrand ? product.brand_id === selectedBrand : true;
        const matchesCategory = selectedCategory
            ? product.categories.some((cat) => cat.id === selectedCategory)
            : true;
        return matchesBrand && matchesCategory;
    });

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const columns = [
        {
            title: "Ảnh sản phẩm",
            dataIndex: "thumbnail",
            key: "thumbnail",
            render: (_, item) => <Image width={45} height={60} src={item.thumbnail} />,
            align: "center",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            align: "center",
            width: 350,
        },
        {
            title: "Giá nhập (VNĐ)",
            key: "price",
            dataIndex: "price",
            align: "center",
            render: (price) => formatPrice(price),
        },
        {
            title: "Giá bán (VNĐ)",
            key: "sell_price",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => formatPrice(sell_price),
        },
        {
            title: "Số lượng",
            key: "quantity",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Link to={`/detailad/${item.id}`} className="action-link action-link-purple">
                        Chi tiết
                    </Link>
                    <div className="divider"></div>
                    <Link to={`/edit-pr/${item.id}`} className="action-link action-link-blue">
                        Cập nhật
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <>
            <h1 className="mb-5">
                <BookOutlined style={{ marginRight: "8px" }} />
                Danh sách sản phẩm
            </h1>

            <div className="btn">
                <div className="btn-group">
                    <Select
                        placeholder="Chọn danh mục"
                        className="select-item"
                        showSearch
                        allowClear
                        onChange={(value) => setSelectedCategory(value)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categories.flatMap((category) =>
                            category.children
                                .filter((child) => child.parent_id !== null)
                                .map((child) => (
                                    <Select.Option key={child.id} value={child.id}>
                                        {child.name}
                                    </Select.Option>
                                ))
                        )}
                    </Select>

                    <Select
                        placeholder="Chọn thương hiệu"
                        className="select-item"
                        showSearch
                        allowClear
                        onChange={(value) => setSelectedBrand(value)}
                    >
                        {brands && brands.map((brand) => (
                            <Select.Option key={brand.id} value={brand.id}>
                                {brand.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="btn-group">
                    <Link to="/add-pr">
                        <Button color="primary" variant="outlined" icon={<PlusOutlined />}>
                            Thêm sản phẩm
                        </Button>
                    </Link>

                    <Link to="/import">
                        <Button color="primary" variant="solid" icon={<PlusOutlined />}>
                            Nhập hàng
                        </Button>
                    </Link>
                </div>
            </div>

            <Skeleton active loading={isProductsLoading}>
                <Table
                    columns={columns}
                    dataSource={filteredProducts || []}
                    expandable={{
                        expandedRowRender: (record) => {
                            const variants = record.variants || [];
                            return variants.length > 0 ? (
                                <Table
                                    columns={[
                                        {
                                            title: "Ảnh biến thể",
                                            dataIndex: "thumbnail",
                                            key: "thumbnail",
                                            render: (thumbnail) => <Image width={45} height={60} src={thumbnail} />,
                                            align: "center",
                                            width: 180,
                                        },
                                        {
                                            title: "Tên biến thể",
                                            key: "name",
                                            render: (_, variant) => {
                                                const attributeValues = variant.attribute_value_product_variants?.map(
                                                    (attr) => attr.attribute_value?.value
                                                ) || [];
                                                return `${record.name} - ${attributeValues.join(" - ")}`;
                                            },
                                            align: "center",
                                            width: 330,
                                        },
                                        {
                                            title: "Giá nhập (VNĐ)",
                                            dataIndex: "price",
                                            key: "price",
                                            render: (price) => formatPrice(price),
                                            align: "center",
                                            width: 200,
                                        },
                                        {
                                            title: "Giá bán (VNĐ)",
                                            dataIndex: "sell_price",
                                            key: "sell_price",
                                            render: (sell_price) => formatPrice(500000),
                                            align: "center",
                                            width: 130,
                                        },
                                        {
                                            title: "Số lượng",
                                            dataIndex: "quantity",
                                            key: "quantity",
                                            align: "center",
                                            render: () => 50,
                                            width: 140,
                                        },
                                        {},
                                    ]}
                                    dataSource={variants}
                                    pagination={false}
                                    showHeader={false} 
                                    rowKey="id"
                                />
                            ) : (
                                <div style={{ textAlign: "center", padding: "10px 0" }}>Không có sản phẩm cùng loại</div>
                            );
                        },
                    }}
                    pagination={{ pageSize: 6 }}
                    rowKey="id"
                />
            </Skeleton>
        </>
    );
};

export default List;