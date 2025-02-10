import React, { useState, useEffect } from "react";
import { Button, Image, Skeleton, Table, Select, Modal, Form, InputNumber, Upload, notification, Switch } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import "./list.css";
import "./add.css";
import { productsServices } from "../../services/product";
import { variantsServices } from "../../services/variants";
import { BrandsServices } from "../../services/brands";
import { categoryServices } from "../../services/categories";

const List = () => {
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentVariant, setCurrentVariant] = useState(null);
    const [newPrice, setNewPrice] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [isActive, setIsActive] = useState(1);

    // Fetch danh sách sản phẩm
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

    const handleEditVariant = (variant) => {
        setCurrentVariant(variant);
        setNewPrice(variant.sell_price);
        setNewImage(variant.thumbnail);
        setIsActive(variant.is_active ?? 1);
        setIsModalVisible(true);
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handleImageUpload = (info) => {
        if (info.file.status === "done" && info.file.response) {
            setNewImage(info.file.response.secure_url); // Cập nhật ảnh mới
        }
    };

    const updateVariantMutation = useMutation({
        mutationFn: async (payload) => {
            return await variantsServices.updateVariants(currentVariant.id, payload);
        },
        onSuccess: (updatedVariant) => {
            console.log("API response:", updatedVariant); // Kiểm tra phản hồi từ API

            notification.success({
                message: "Cập nhật thành công",
                description: "Biến thể đã được cập nhật thành công.",
            });

            // Cập nhật trực tiếp state để phản ánh thay đổi ngay lập tức
            setCurrentVariant((prevVariant) => ({
                ...prevVariant,
                sell_price: newPrice,
                thumbnail: newImage,
            }));
            queryClient.invalidateQueries(["products"]);
            setIsModalVisible(false);
        },
        onError: (error) => {
            console.error("Lỗi khi cập nhật biến thể:", error);
            notification.error({
                message: "Cập nhật thất bại",
                description: error.message,
            });
        },
    });

    const handleSaveVariant = () => {
        if (!currentVariant) return;

        const payload = {
            sell_price: newPrice,
            thumbnail: newImage,
            is_active: isActive,
        };

        console.log("Sending payload to API:", payload);
        updateVariantMutation.mutate(payload, {
            onSuccess: () => {
                // Reset form sau khi cập nhật thành công
                setNewImage(null);
                setNewPrice(null);
                setIsModalVisible(false);
            }
        });

        // Cập nhật trạng thái riêng biệt
        activeVariantMutation.mutate({ is_active: isActive });

        setIsModalVisible(false);
    };

    const activeVariantMutation = useMutation({
        mutationFn: async (payload) => {
            return await variantsServices.activeVariants(currentVariant.id, payload);
        },
        onError: (error) => {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            notification.error({
                message: "Cập nhật trạng thái thất bại",
                description: error.message,
            });
        },
    });

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
            title: "Giá bán (VNĐ)",
            key: "sell_price",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
        {
            title: "Tồn kho",
            key: "quantity",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: 'Trạng thái',
            key: 'is_active',
            dataIndex: 'is_active',
            align: 'center',
            render: (isActive) => (
                <span className={isActive === 1 ? 'action-link-blue' : 'action-link-red'}>
                    {isActive === 1 ? 'Đang kinh doanh' : 'Dừng kinh doanh'}
                </span>
            ),
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
                                            width: 170,
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
                                            width: 340,
                                        },
                                        {
                                            title: "Giá bán (VNĐ)",
                                            dataIndex: "sell_price",
                                            key: "sell_price",
                                            render: (sell_price) => formatPrice(sell_price),
                                            align: "center",
                                            width: 180,
                                        },
                                        {
                                            title: "Tồn kho",
                                            dataIndex: "quantity",
                                            key: "quantity",
                                            align: "center",
                                            render: () => 50, // Placeholder for stock
                                            width: 90,
                                        },
                                        {
                                            title: 'Trạng thái',
                                            key: 'is_active',
                                            dataIndex: 'is_active',
                                            align: 'center',
                                            render: (isActive) => (
                                                <span className={isActive === 1 ? 'action-link-blue' : 'action-link-red'}>
                                                    {isActive === 1 ? 'Đang kinh doanh' : 'Dừng kinh doanh'}
                                                </span>
                                            ),
                                        },
                                        {
                                            title: "Thao tác",
                                            key: "action",
                                            align: "center",
                                            render: (_, variant) => (
                                                <Button
                                                    className="action-link action-link-blue"
                                                    type="link"
                                                    onClick={() => handleEditVariant(variant)}
                                                >
                                                    Cập nhật
                                                </Button>
                                            ),
                                        },
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

            <Modal 
                title="Cập nhật biến thể" 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                footer={null}
            >
                <Form layout="vertical">
                    <Form.Item label="Giá bán">
                        <InputNumber 
                            className="input-item" 
                            value={newPrice} 
                            onChange={setNewPrice} 
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Ảnh" 
                        name="newImage"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[
                            {
                                validator: (_, value) =>
                                newImage ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh"),
                            },
                        ]}
                    >
                        <Upload 
                            listType="picture" 
                            action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                            data={{upload_preset: "quangOsuy"}}
                            onChange={handleImageUpload}
                            fileList={newImage ? [{ uid: '-1', name: 'current-image', status: 'done', url: newImage }] : []}
                        >
                            <Button icon={<UploadOutlined />} className="btn-item">
                                Tải ảnh lên
                            </Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Trạng thái">
                        <Switch checked={isActive === 1} onChange={(checked) => setIsActive(checked ? 1 : 0)} />
                        <span style={{ marginLeft: 10 }}>
                            {isActive === 1 ? "Đang kinh doanh" : "Dừng kinh doanh"}
                        </span>
                    </Form.Item>

                    <div className="add">
                        <Button type="primary" onClick={handleSaveVariant}>Cập nhật</Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default List;
