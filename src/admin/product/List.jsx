import React, { useState, useEffect } from "react";
import { Button, Image, notification, Skeleton, Table, Modal, Form, Select } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./list.css";
import { productsServices } from "../../services/product";
import { BrandsServices } from './../../services/brands';
import { categoryServices } from './../../services/categories';

const List = () => {
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState(null);

    // State lưu giá trị thương hiệu được chọn
    const [selectedBrand, setSelectedBrand] = useState(null);

    // Fetch danh sách sản phẩm
    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        }
    });

    // Fetch danh sách thương hiệu
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await BrandsServices.fetchBrands();
            return response.data;
        }
    });

    // Lấy danh sách danh mục
    const [categories, setCategories] = useState([]);
    const fetchData = async () => {
        const response = await categoryServices.fetchCategories();
        setCategories(response);
    };
    useEffect(() => {
        fetchData();
    }, []);

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    // Dữ liệu sản phẩm đã được lọc theo thương hiệu
    const filteredProducts = products?.filter((product) => {
        const matchesBrand = selectedBrand ? product.brand_id === selectedBrand : true;
        const matchesCategory = selectedCategory
            ? product.categories.some((cat) => cat.id === selectedCategory)
            : true;
        return matchesBrand && matchesCategory;
    });    

    const columns = [
        // {
        //     title: "",
        //     render: () => <input className="tick" type="checkbox" />,
        //     align: "center",
        // },
        {
            title: "Ảnh sản phẩm",
            dataIndex: "thumbnail",
            key: "thumbnail",
            render: (_, item) => {
                return <Image width={45} height={60} src={item.thumbnail} />;
            },
            align: "center",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            align: "center",
            width: 360
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
            title: "Thương hiệu",
            dataIndex: "brand_id",
            key: "brand_id",
            align: "center",
            render: (brand_id) => {
                if (!brands || !Array.isArray(brands)) return "Đang tải...";
                const brand = brands.find((b) => b.id === brand_id);
                return brand ? brand.name : "Không xác định";
            },
        },
        {
            title: "Thao tác",
            key: "action",
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
            align: "center",
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
                                <Option key={child.id} value={child.id}>
                                    {child.name}
                                </Option>
                            ))
                        )}
                    </Select>

                    <Select
                        placeholder="Chọn thương hiệu"
                        className="select-item"
                        showSearch
                        allowClear
                        onChange={(value) => setSelectedBrand(value)}  // Cập nhật thương hiệu được chọn
                    >
                        {brands && brands.map((brand) => (
                            <Option key={brand.id} value={brand.id}>
                                {brand.name}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div className="btn-group">
                    <Link to="/add-pr">
                        <Button color="primary" variant="outlined" icon={<PlusOutlined />}>
                            Thêm sản phẩm
                        </Button>
                    </Link>

                    {/* <Button color="danger" variant="solid" icon={<DeleteOutlined />}>
                        Xóa sản phẩm
                    </Button> */}

                    <Button color="primary" variant="solid" icon={<PlusOutlined />}>
                        Nhập hàng
                    </Button>
                </div>
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={filteredProducts || []}
                    pagination={{ pageSize: 6 }}
                />
            </Skeleton>
        </>
    );
};

export default List;
