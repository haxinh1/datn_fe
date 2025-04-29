import React, { useEffect, useState } from "react";
import { Button, Table, InputNumber, notification, AutoComplete, Tooltip, Form, Checkbox, Upload, DatePicker } from "antd";
import { useQuery } from "@tanstack/react-query";
import { productsServices } from "../../services/product";
import { DeleteOutlined, ImportOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "../../css/add.css";
import "../../css/list.css";
import dayjs from "dayjs";

const Import = () => {
    const [form] = Form.useForm();
    const [addedVariants, setAddedVariants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loggedInUserRole, setLoggedInUserRole] = useState([]);

    // Fetch danh sách sản phẩm và biến thể
    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setLoggedInUserRole(userData.role);
        }
    }, []);

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
                    key: `V-${variant.id}`, // ✅ Unique key cho biến thể
                    id: variant.id,
                    productId: selectedProduct.id,
                    quantity: 1,
                    price: 0,
                    sell_price: variant.sell_price || 0,
                    sale_price: variant.sale_price || 0,
                    total: 0,
                    variantName: `${selectedProduct.name} - ${variant.attribute_value_product_variants.map(attr => attr.attribute_value.value).join(" - ")}`,
                }))
                : [{
                    key: `P-${selectedProduct.id}`, // ✅ Unique key cho sản phẩm chính
                    id: selectedProduct.id,
                    productId: selectedProduct.id,
                    quantity: 1,
                    price: 0,
                    sell_price: selectedProduct.sell_price || 0,
                    sale_price: selectedProduct.sale_price || 0,
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
    const updateItem = (key, field, value) => {
        setAddedVariants(prevItems =>
            prevItems.map(item =>
                item.key === key // ✅ So sánh theo key để tránh trùng ID
                    ? {
                        ...item,
                        [field]: value,
                        total: (field === "price" ? value : item.price) * (field === "quantity" ? value : item.quantity)
                    }
                    : item
            )
        );
    };

    // Xóa sản phẩm khỏi danh sách
    const removeItem = (key) => {
        setAddedVariants(prevItems => prevItems.filter(item => item.key !== key));
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

            // Chỉ thêm sale_price_start_at và sale_price_end_at nếu sale_price có giá trị
            const salePriceData = item.sale_price && item.sale_price !== ""
                ? {
                    sale_price: item.sale_price,
                    sale_price_start_at: item.sale_price_start_at || "",
                    sale_price_end_at: item.sale_price_end_at || ""
                }
                : {};

            if (item.variantName.includes("-")) {
                // Nếu là biến thể, thêm vào danh sách variants
                groupedProducts[item.productId].variants.push({
                    id: item.id,
                    price: item.price,
                    sell_price: item.sell_price,
                    quantity: item.quantity,
                    ...salePriceData // Thêm sale_price và 2 ngày nếu có
                });
            } else {
                // Nếu là sản phẩm đơn, lưu trực tiếp
                groupedProducts[item.productId] = {
                    id: item.productId,
                    price: item.price,
                    sell_price: item.sell_price,
                    quantity: item.quantity,
                    ...salePriceData // Thêm sale_price và 2 ngày nếu có
                };
            }
        });

        const productsArray = Object.values(groupedProducts);

        const payload = {
            products: productsArray
        };

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

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedRowKeys(addedVariants.map(item => item.key)); // Chọn tất cả
        } else {
            setSelectedRowKeys([]); // Bỏ chọn tất cả
        }
    };

    const handleRowSelectionChange = (selectedRowKeys) => {
        setSelectedRowKeys(selectedRowKeys); // Cập nhật hàng được chọn
    };

    const handleRemoveSelected = () => {
        setAddedVariants(prevItems => prevItems.filter(item => !selectedRowKeys.includes(item.key)));
        setSelectedRowKeys([]); // Reset lại danh sách đã chọn
    };

    const handleDateChange = (date, type, record) => {
        setAddedVariants(prevVariants =>
            prevVariants.map(item =>
                item.key === record.key
                    ? {
                        ...item,
                        ...(type === "start" && { sale_price_start_at: date ? date.format("YYYY-MM-DD") : null }),
                        ...(type === "end" && { sale_price_end_at: date ? date.format("YYYY-MM-DD") : null }),
                    }
                    : item
            )
        );
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

            // ✅ Thông báo dựa vào role
            if (loggedInUserRole === 'admin') {
                notification.success({
                    message: "Nhập hàng thành công.",
                });
            } else {
                notification.success({
                    message: "Đơn hàng đã được thêm!",
                    description: "Đợi sự xác nhận từ quản lý.",
                });
            }

            setAddedVariants([]); // Reset danh sách sản phẩm sau khi nhập hàng thành công
            form.resetFields();
        } catch (error) {
            console.error("Lỗi khi nhập hàng:", error);
        }
    };

    return (
        <div>
            <h1 className="mb-5">
                <ImportOutlined style={{ marginRight: "8px" }} />
                Nhập hàng
            </h1>

            <div className="attribute">
                <AutoComplete
                    className="input-item"
                    placeholder="Tìm kiếm sản phẩm"
                    value={searchQuery}
                    onSearch={handleSearch}
                    onSelect={(value, option) => handleSelectProduct(value, option)}
                    prefix={<SearchOutlined />}
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

                <Link to="/admin/creat">
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
                <div className="group2">
                    <Button
                        color="danger"
                        variant="solid"
                        icon={<DeleteOutlined />}
                        onClick={handleRemoveSelected}
                        disabled={selectedRowKeys.length === 0}
                    >
                        Xóa
                    </Button>
                </div>

                <Table
                    dataSource={addedVariants}
                    rowKey="key"
                    pagination={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: handleRowSelectionChange,
                        getCheckboxProps: record => ({
                            disabled: false, // Có thể tùy chỉnh để vô hiệu hóa checkbox
                        }),
                    }}
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
                                    name={`price_${record.key}`}
                                    initialValue={record.price}
                                    rules={[
                                        {
                                            type: "number",
                                            min: 1,
                                            message: "Giá nhập phải lớn hơn 0!",
                                        },
                                        // Kiểm tra rule chỉ khi không phải là manager
                                        loggedInUserRole !== "manager" && ({
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
                                    ].filter(Boolean)}
                                >
                                    <InputNumber
                                        className="input-form"
                                        min={1}
                                        formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                                        parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                                        onChange={(value) => {
                                            form.setFieldsValue({ [`price_${record.key}`]: value }); // Cập nhật giá vào form
                                            updateItem(record.key, "price", value); // ✅ Cập nhật giá vào danh sách
                                        }}
                                    />
                                </Form.Item>
                            ),
                        },
                        {
                            title: "Giá bán (VNĐ)",
                            dataIndex: "sell_price",
                            align: "center",
                            render: (_, record) => {
                                const uniqueKey = `${record.productId}_${record.id}`; // Định danh duy nhất

                                return (
                                    <Form.Item
                                        name={`sell_price_${uniqueKey}`}
                                        initialValue={record.sell_price}
                                        rules={[
                                            // Kiểm tra rule chỉ khi không phải là manager
                                            loggedInUserRole !== "manager" && ({
                                                validator(_, value) {
                                                    if (value === undefined || value === null) {
                                                        return Promise.reject("Vui lòng nhập giá bán!");
                                                    }
                                                    if (value <= record.price) {
                                                        return Promise.reject("Giá bán phải lớn hơn giá nhập!");
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ].filter(Boolean)}
                                    >
                                        <InputNumber
                                            className="input-form"
                                            min={1}
                                            disabled={loggedInUserRole === "manager"}
                                            formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                            parser={value => value?.replace(/\./g, "")}
                                            onChange={(value) => {
                                                form.setFieldsValue({ [`sell_price_${uniqueKey}`]: value });
                                                updateItem(record.key, "sell_price", value);
                                            }}
                                        />
                                    </Form.Item>
                                );
                            },
                        },
                        {
                            title: "Giá KM (VNĐ)",
                            dataIndex: "sale_price",
                            align: "center",
                            render: (_, record) => {
                                const uniqueKey = `${record.productId}_${record.id}`;
                                return (
                                    <Form.Item
                                        name={`sale_price_${uniqueKey}`}
                                        initialValue={record.sale_price}
                                        rules={[
                                            loggedInUserRole !== "manager" && ({
                                                validator(_, value) {
                                                    // Nếu không nhập giá KM, bỏ qua validate
                                                    if (value === undefined || value === null || value === "") {
                                                        return Promise.resolve();
                                                    }
                                                    // Nếu nhập giá KM, kiểm tra giá trị
                                                    if (value >= record.sell_price) {
                                                        return Promise.reject("Giá KM phải nhỏ hơn giá bán!");
                                                    }
                                                    
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ].filter(Boolean)}
                                    >
                                        <InputNumber
                                            className="input-form"
                                            min={0}
                                            disabled={loggedInUserRole === "manager"}
                                            formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                            parser={value => value?.replace(/\./g, "")}
                                            onChange={(value) => {
                                                form.setFieldsValue({ [`sale_price_${uniqueKey}`]: value });
                                                updateItem(record.key, "sale_price", value);
                                            }}
                                        />
                                    </Form.Item>
                                );
                            },
                        },
                        {
                            title: "Ngày mở KM",
                            dataIndex: "sale_price_start_at",
                            key: "sale_price_start_at",
                            align: "center",
                            render: (_, record) => {
                                const uniqueKey = `${record.productId}_${record.id}`;
                                return (
                                    <Form.Item
                                        name={`sale_price_start_at_${uniqueKey}`}
                                        initialValue={record.sale_price_start_at ? dayjs(record.sale_price_start_at) : null}
                                        rules={[
                                            loggedInUserRole !== "manager" && ({
                                                validator(_, value) {
                                                    const salePrice = getFieldValue(`sale_price_${uniqueKey}`);
                                                    // Nếu không nhập giá KM, bỏ qua validate
                                                    if (!salePrice) {
                                                        return Promise.resolve();
                                                    }
                                                    // Nếu nhập giá KM mà không nhập ngày mở, báo lỗi
                                                    if (!value) {
                                                        return Promise.reject("Vui lòng chọn ngày mở khuyến mại!");
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker
                                            className="input-form"
                                            format="DD/MM/YYYY"
                                            disabled={loggedInUserRole === "manager"}
                                            value={record.sale_price_start_at ? dayjs(record.sale_price_start_at) : null}
                                            onChange={(date) => handleDateChange(date, "start", record)}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </Form.Item>
                                );
                            },
                        },
                        {
                            title: "Ngày đóng KM",
                            dataIndex: "sale_price_end_at",
                            key: "sale_price_end_at",
                            align: "center",
                            render: (_, record) => {
                                const uniqueKey = `${record.productId}_${record.id}`;
                                return (
                                    <Form.Item
                                        name={`sale_price_end_at_${uniqueKey}`}
                                        initialValue={record.sale_price_end_at ? dayjs(record.sale_price_end_at) : null}
                                        rules={[
                                            loggedInUserRole !== "manager" && ({
                                                validator(_, value) {
                                                    const salePrice = getFieldValue(`sale_price_${uniqueKey}`);
                                                    const startDate = getFieldValue(`sale_price_start_at_${uniqueKey}`);
                                                    // Nếu không nhập giá KM, bỏ qua validate
                                                    if (!salePrice) {
                                                        return Promise.resolve();
                                                    }
                                                    // Nếu không nhập ngày mở, không validate ngày đóng
                                                    if (!startDate) {
                                                        return Promise.resolve();
                                                    }
                                                    // Nếu nhập giá KM mà không nhập ngày đóng, báo lỗi
                                                    if (!value) {
                                                        return Promise.reject("Vui lòng chọn ngày đóng khuyến mại!");
                                                    }
                                                    // Ngày đóng không được trùng ngày mở
                                                    if (value && startDate && value.isSame(startDate, 'day')) {
                                                        return Promise.reject("Ngày đóng không được trùng ngày mở!");
                                                    }
                                                    // Ngày đóng phải sau ngày mở
                                                    if (value && startDate && value.isBefore(startDate, 'day')) {
                                                        return Promise.reject("Ngày đóng phải sau ngày mở!");
                                                    }
                                                    return Promise.resolve();
                                                },
                                            }),
                                        ]}
                                    >
                                        <DatePicker
                                            className="input-form"
                                            format="DD/MM/YYYY"
                                            disabled={loggedInUserRole === "manager"}
                                            value={record.sale_price_end_at ? dayjs(record.sale_price_end_at) : null}
                                            onChange={(date) => handleDateChange(date, "end", record)}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </Form.Item>
                                );
                            },
                        },
                        {
                            title: "Số lượng",
                            dataIndex: "quantity",
                            align: "center",
                            render: (text, record) => (
                                <InputNumber
                                    min={1}
                                    value={record.quantity}
                                    onChange={(value) => updateItem(record.key, "quantity", value)}
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
                            title: "",
                            key: "action",
                            align: "center",
                            render: (_, record) => (
                                <Tooltip title="Xóa sản phẩm">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeItem(record.key)}
                                    />
                                </Tooltip>
                            ),
                        },
                    ]}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={7} align="right">
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
                        Hoàn thành
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Import;