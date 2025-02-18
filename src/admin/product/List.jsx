import React, { useState, useEffect } from "react";
import { Button, Image, Skeleton, Table, Select, Modal, Form, InputNumber, Upload, notification, Switch, Tooltip, DatePicker } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOutlined, EditOutlined, EyeOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import "./list.css";
import "./add.css";
import { productsServices } from "../../services/product";
import { variantsServices } from "../../services/variants";
import { BrandsServices } from "../../services/brands";
import { categoryServices } from "../../services/categories";
import dayjs from "dayjs";

const List = () => {
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentVariant, setCurrentVariant] = useState(null);
    const [newPrice, setNewPrice] = useState(null);
    const [newSalePrice, setNewSalePrice] = useState(null);
    const [newImage, setNewImage] = useState(null);
    const [isActive, setIsActive] = useState(1);
    const [startDate, setStartDate] = useState(null); // Trạng thái ngày mở KM
    const [endDate, setEndDate] = useState(null); // Trạng thái ngày đóng KM

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

    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    const convertImageToFileObject = async (imageUrl) => {
        if (!imageUrl) return null;
        const file = await urlToFile(imageUrl, "variant-thumbnail.jpg");
        return {
            uid: "-1",
            name: file.name,
            status: "done",
            url: imageUrl,
            originFileObj: file,
        };
    };

    const handleEditVariant = async (variant) => {
        setCurrentVariant(variant);
        setNewPrice(variant.sell_price);
        setNewSalePrice(variant.sale_price);
        setIsActive(variant.is_active ?? 1); // Set đúng giá trị trạng thái ban đầu
        setStartDate(variant.sale_price_start_at ? dayjs(variant.sale_price_start_at) : null); // Lấy ngày bắt đầu
        setEndDate(variant.sale_price_end_at ? dayjs(variant.sale_price_end_at) : null); // Lấy ngày kết thúc

        // Lấy trạng thái sản phẩm chính
        const parentProduct = products.find((p) => p.id === variant.product_id);
        if (parentProduct && parentProduct.is_active === 0) {
            setIsActive(0); // Nếu sản phẩm chính đã tắt, biến thể cũng phải hiển thị tắt
        } else {
            setIsActive(variant.is_active ?? 1); // Lấy trạng thái gốc của biến thể
        }
        
        if (variant.thumbnail) {
            const fileObject = await convertImageToFileObject(variant.thumbnail);
            setNewImage(fileObject);
        } else {
            setNewImage(null);
        }
    
        setIsModalVisible(true);
    };

    const handleImageUpload = (info) => {
        let fileList = [...info.fileList];
    
        // Nếu ảnh mới được upload thành công, cập nhật `thumbnail`
        if (info.file.status === "done" && info.file.response) {
            fileList = fileList.map((file) => ({
                uid: file.uid,
                name: file.name,
                status: "done",
                url: file.response.secure_url, // Lấy URL từ response Cloudinary
            }));
        }
    
        // Cập nhật state
        setNewImage(fileList.length > 0 ? fileList[0] : null);
    };

    // cập nhật biến thể
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
                sale_price: newSalePrice,
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

        // Kiểm tra giá khuyến mại phải nhỏ hơn giá bán
        if (newSalePrice >= newPrice) {
            notification.warning({
                message: "Lỗi cập nhật",
                description: "Giá khuyến mại phải nhỏ hơn giá bán.",
            });
            return;
        }

        // Kiểm tra nếu sản phẩm chính đang dừng kinh doanh, không cho phép bật biến thể
        const parentProduct = products.find((p) => p.id === currentVariant.product_id);
        if (parentProduct && parentProduct.is_active === 0 && isActive === 1) {
            notification.warning({
                message: "Không thể thay đổi trạng thái",
                description: "Sản phẩm đã dừng kinh doanh, không thể bật trạng thái biến thể.",
            });
            return;
        }
    
        const payload = {
            sell_price: newPrice,
            sale_price: newSalePrice,
            thumbnail: newImage ? newImage.url : null, 
            is_active: isActive,
            sale_price_start_at: startDate ? startDate.format("YYYY-MM-DD") : null, // Đảm bảo ngày bắt đầu được gửi
            sale_price_end_at: endDate ? endDate.format("YYYY-MM-DD") : null, // Đảm bảo ngày kết thúc được gửi
        };
    
        console.log("Sending payload to API:", payload);
        updateVariantMutation.mutate(payload, {
            onSuccess: () => {
                setNewImage(null);
                setNewPrice(null);
                setIsModalVisible(false);
            }
        });
    
        if (currentVariant.is_active !== isActive) {
            activeVariantMutation.mutate({ is_active: isActive });
        }
    
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
            title: "Ảnh",
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
            width: 320,
        },
        {
            title: "Giá bán (VNĐ)",
            key: "sell_price",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
        {
            title: "Giá KM (VNĐ)",
            key: "sale_price",
            dataIndex: "sale_price",
            align: "center",
            render: (sale_price) => (sale_price ? formatPrice(sale_price) : ""),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            align: "center",
            render: (stock) => (
                <span style={stock <= 3 ? { color: "red", fontWeight: "bold" } : {}}>
                    {stock}
                </span>
            ),
        },            
        {
            title: "Ngày khuyến mại",
            key: "sale_price",
            dataIndex: "sale_price",
            align: "center",
            render: (_, product) => {
                const startDate = product.sale_price_start_at ? dayjs(product.sale_price_start_at) : null;
                const endDate = product.sale_price_end_at ? dayjs(product.sale_price_end_at) : null;
    
                // Kiểm tra nếu có ngày bắt đầu và kết thúc, rồi hiển thị ngày trong định dạng "DD/MM"
                if (startDate && endDate) {
                    return `${startDate.format('DD/MM')} - ${endDate.format('DD/MM')}`;
                }
                return "";
            },
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
                    <Tooltip title="Chi tiết">
                        <Link to={`/detailad/${item.id}`}>
                            <Button color="purple" variant="solid" icon={<EyeOutlined />} />
                        </Link>
                    </Tooltip>
                    
                    <Tooltip title="Cập nhật">
                        <Link to={`/edit-pr/${item.id}`}>
                            <Button color="primary" variant="solid" icon={<EditOutlined />} />
                        </Link>
                    </Tooltip>
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

            <div className="group1">
                <div className="group1">
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

                <div className="group2">
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
                                            title: "Ảnh",
                                            dataIndex: "thumbnail",
                                            key: "thumbnail",
                                            render: (thumbnail) => <Image width={45} height={60} src={thumbnail} />,
                                            align: "center",
                                        },
                                        {
                                            title: "Tên biến thể",
                                            key: "name",
                                            width: 320,
                                            render: (_, variant) => {
                                                const attributeValues = variant.attribute_value_product_variants?.map(
                                                    (attr) => attr.attribute_value?.value
                                                ) || [];
                                                return `${record.name} - ${attributeValues.join(" - ")}`;
                                            },
                                            align: "center",
                                        },
                                        {
                                            title: "Giá bán (VNĐ)",
                                            dataIndex: "sell_price",
                                            key: "sell_price",
                                            render: (sell_price) => formatPrice(sell_price),
                                            align: "center",
                                            width: 140,
                                        },
                                        {
                                            title: "Giá KM (VNĐ)",
                                            dataIndex: "sale_price",
                                            key: "sale_price",
                                            render: (sale_price) => formatPrice(sale_price),
                                            align: "center",
                                            width: 130,
                                        },
                                        {
                                            title: "Tồn kho",
                                            dataIndex: "stock",
                                            key: "stock",
                                            align: "center",
                                            width: 100,
                                            render: (stock) => (
                                                <span style={stock <= 3 ? { color: "red", fontWeight: "bold" } : {}}>
                                                    {stock}
                                                </span>
                                            ),
                                        },                                        
                                        {
                                            title: "Ngày khuyến mại",
                                            key: "sale_price",
                                            dataIndex: "sale_price",
                                            align: "center",
                                            width: 150,
                                            render: (_, variant) => {
                                                const startDate = variant.sale_price_start_at ? dayjs(variant.sale_price_start_at) : null;
                                                const endDate = variant.sale_price_end_at ? dayjs(variant.sale_price_end_at) : null;
                
                                                if (startDate && endDate) {
                                                    return `${startDate.format('DD/MM')} - ${endDate.format('DD/MM')}`;
                                                }
                                                return "";
                                            },
                                        },
                                        {
                                            title: 'Trạng thái',
                                            key: 'is_active',
                                            dataIndex: 'is_active',
                                            align: 'center',
                                            width: 150,
                                            render: (isActive, variant) => {
                                                // Nếu sản phẩm chính đã ngừng kinh doanh, buộc hiển thị trạng thái ngừng kinh doanh
                                                const parentProduct = products.find((p) => p.id === variant.product_id);
                                                const displayStatus = parentProduct && parentProduct.is_active === 0 ? 0 : isActive;
                                        
                                                return (
                                                    <span className={displayStatus === 1 ? 'action-link-blue' : 'action-link-red'}>
                                                        {displayStatus === 1 ? 'Đang kinh doanh' : 'Dừng kinh doanh'}
                                                    </span>
                                                );
                                            },
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
                    pagination={{ pageSize: 8 }}
                    rowKey="id"
                />
            </Skeleton>

            <Modal 
                title="Cập nhật biến thể" 
                visible={isModalVisible} 
                onCancel={() => setIsModalVisible(false)} 
                footer={null}
            >
                <h5 className="action-link-purple">
                    {currentVariant
                        ? `${products.find(p => p.id === currentVariant.product_id)?.name || ""} - ${
                            currentVariant.attribute_value_product_variants
                                ?.map(attr => attr.attribute_value?.value)
                                .join(" - ") || "Không có thuộc tính"
                        }`
                        : ""}
                </h5>

                <Form layout="vertical">
                    <Form.Item 
                        label="Giá bán (VNĐ)"
                        name="sell_price"
                        initialValue={newPrice}  // Đảm bảo hiển thị giá trị mặc định
                        rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                    >
                        <InputNumber 
                            formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                            parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                            className="input-item" 
                            value={newPrice} 
                            onChange={setNewPrice} 
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Giá khuyến mại (VNĐ)"
                    >
                        <InputNumber 
                            formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                            parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                            className="input-item" 
                            value={newSalePrice} 
                            onChange={setNewSalePrice} 
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày mở khuyến mại"
                    >
                        <DatePicker
                            value={startDate} 
                            onChange={(date) => setStartDate(date)} 
                            className="input-item"
                            format="DD-MM-YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày đóng khuyến mại"
                    >
                        <DatePicker
                            value={endDate} 
                            onChange={(date) => setEndDate(date)} 
                            className="input-item"
                            format="DD-MM-YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh"
                        name="newImage"
                        rules={[{
                            validator: (_, value) =>
                            newImage ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh"),
                        }]}
                    >
                        <Upload
                            listType="picture"
                            action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                            data={{ upload_preset: "quangOsuy" }}
                            fileList={newImage ? [newImage] : []}
                            onChange={handleImageUpload}
                            onRemove={() => setNewImage(null)} 
                        >
                            {!newImage && ( 
                                <Button icon={<UploadOutlined />} className="btn-item">
                                    Tải ảnh lên
                                </Button>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item label="Trạng thái kinh doanh">
                        <Switch 
                            checked={isActive === 1} 
                            onChange={(checked) => setIsActive(checked ? 1 : 0)} 
                        />
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