import { Button, Table, Modal, DatePicker, ConfigProvider, Form, Select, InputNumber, notification, Tooltip, Skeleton, Checkbox, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { productsServices } from '../../services/product';
import { useQuery } from '@tanstack/react-query';
import { EditOutlined, EyeOutlined, ImportOutlined, ToTopOutlined } from '@ant-design/icons';
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
import { Link } from 'react-router-dom';
import "../../css/add.css";
import "../../css/list.css";
import { saveAs } from 'file-saver';

const History = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]);
    const { RangePicker } = DatePicker;
    const [filterStatus, setFilterStatus] = useState(null);
    const [confirmStatus, setConfirmStatus] = useState(null);
    const [modalData, setModalData] = useState([]);
    const [form] = Form.useForm();
    const [selectedRows, setSelectedRows] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [loggedInUserRole, setLoggedInUserRole] = useState([]);

    // Fetch danh sách đơn nhập hàng
    const { data: stocks, isLoading: isProductsLoading, refetch: refetchStocks } = useQuery({
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

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData) {
            setLoggedInUserRole(userData.role);
        }
    }, []);

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

    const handleShow = (record) => {
        setSelectedStock(record);
        setDetailModal(true);
    };

    // lọc ngày nhập hàng
    const adjustedStocks = stocks?.map(stock => ({
        ...stock,
        ngaytao: stock.ngaytao ? dayjs(stock.ngaytao).add(7, 'hour').format() : null, // Điều chỉnh sang GMT+7
    }))
        .filter(stock => {
            if (!dateRange[0] || !dateRange[1]) return true; // ✅ Khi clear ngày, hiển thị tất cả
            return (
                dayjs(stock.ngaytao).isAfter(dateRange[0].startOf('day')) &&
                dayjs(stock.ngaytao).isBefore(dateRange[1].endOf('day'))
            );
        })
        .filter(stock => filterStatus === null || filterStatus === undefined || stock.status === filterStatus); // ✅ Lọc theo trạng thái

    useEffect(() => {
        if (selectedStock) {
            const newData = selectedStock.products.flatMap(product => {
                const fullProduct = products?.find(p => p.id === product.id);
                if (!fullProduct) return [];

                return (product.variants && product.variants.length > 0)
                    ? product.variants.map(variant => {
                        const fullVariant = fullProduct.variants?.find(v => v.id === variant.id);
                        if (!fullVariant) return null;

                        const attributes = fullVariant.attribute_value_product_variants
                            ?.map(attr => attr.attribute_value?.value)
                            .join(" - ") || "Không có thuộc tính";

                        return {
                            key: `V-${variant.id}`, // ✅ Thêm tiền tố để tránh trùng key
                            originalProductId: product.id, // ✅ Lưu ID sản phẩm gốc
                            isVariant: true,
                            name: `${product.name} - ${attributes}`,
                            price: variant.price,
                            sell_price: fullVariant.sell_price ?? 0,
                            sale_price: fullVariant.sale_price ?? 0,
                            sale_price_start_at: variant.sale_price_start_at ?? null, // Thêm sale_price_start_at
                            sale_price_end_at: variant.sale_price_end_at ?? null,
                            quantity: variant.quantity,
                            total: variant.price * variant.quantity,
                        };
                    }).filter(Boolean)
                    : [{
                        key: `P-${product.id}`, // ✅ Thêm tiền tố để tránh trùng key
                        originalProductId: product.id,
                        isVariant: false,
                        name: product.name,
                        price: product.price,
                        sell_price: fullProduct.sell_price ?? 0,
                        sale_price: fullProduct.sale_price ?? 0,
                        sale_price_start_at: product.sale_price_start_at ?? null, // Thêm sale_price_start_at
                        sale_price_end_at: product.sale_price_end_at ?? null,
                        quantity: product.quantity,
                        total: product.price * product.quantity,
                    }];
            });

            setModalData(newData);
        }
    }, [selectedStock, products]);

    const handleInputChange = (key, field, value) => {
        setModalData(prevData =>
            prevData.map(item =>
                item.key === key
                    ? {
                        ...item,
                        [field]: value || 0,
                        total: (field === "price" || field === "quantity")
                            ? ((field === "price" ? value || 0 : item.price) *
                                (field === "quantity" ? value || 0 : item.quantity))
                            : (item.price * item.quantity) // Đảm bảo tổng tiền luôn cập nhật đúng
                    }
                    : item
            )
        );
    };

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
                        sell_price: fullVariant.sell_price ?? "", // ✅ Lấy giá bán từ API
                        sale_price: fullVariant.sale_price ?? "", // ✅ Lấy giá khuyến mại từ API
                        sale_price_start_at: fullVariant.sale_price_start_at ?? "",
                        sale_price_end_at: fullVariant.sale_price_end_at ?? "",
                        quantity: variant.quantity,
                        total: variant.price * variant.quantity,  // ✅ Tính tổng tiền
                    };
                }).filter(Boolean) // Lọc bỏ null nếu không tìm thấy dữ liệu
                : [{
                    key: index++,  // Đánh số thứ tự đúng
                    name: product.name, // Sản phẩm không có biến thể
                    price: product.price,
                    sell_price: fullProduct.sell_price ?? "", // ✅ Lấy giá bán từ API
                    sale_price: fullProduct.sale_price ?? "", // ✅ Lấy giá khuyến mại từ API
                    sale_price_start_at: fullProduct.sale_price_start_at ?? "",
                    sale_price_end_at: fullProduct.sale_price_end_at ?? "",
                    quantity: product.quantity,
                    total: product.price * product.quantity,  // ✅ Tính tổng tiền
                }];
        });
    };

    const handleDateChange = (date, type, record) => {
        setModalData(prevData =>
            prevData.map(item =>
                item.key === record.key
                    ? {
                        ...item,
                        [type === "start" ? "sale_price_start_at" : "sale_price_end_at"]: date ? date.format("YYYY-MM-DD") : null,
                    }
                    : item
            )
        );
    };

    const handleConfirm = async () => {
        if (!selectedStock) return;

        // Nếu chưa chọn trạng thái, mặc định là 0 (Chờ xác nhận)
        const updatedStatus = confirmStatus ?? 0;

        // Nếu chọn "Hủy" hoặc "Hoàn thành", hiển thị hộp thoại xác nhận trước khi gửi
        if (updatedStatus === -1 || updatedStatus === 1) {
            Modal.confirm({
                title: "Xác nhận cập nhật",
                content: `Bạn có chắc chắn muốn ${updatedStatus === -1 ? "hủy" : "hoàn thành"} đơn nhập hàng này không?`,
                onOk: async () => {
                    await processUpdate(updatedStatus, true);
                },
            });
        } else {
            await processUpdate(updatedStatus, false);
        }
    };

    const processUpdate = async (status, showNotification) => {
        if (!isModalVisible) return;
    
        const groupedProducts = {};
    
        modalData.forEach(item => {
            const productId = item.originalProductId || item.key.replace(/^V-|^P-/, "");
    
            if (!groupedProducts[productId]) {
                groupedProducts[productId] = { id: Number(productId), variants: [] };
            }
    
            // Chỉ thêm sale_price_start_at và sale_price_end_at nếu sale_price có giá trị
            const salePriceData = item.sale_price && item.sale_price !== ""
                ? {
                    sale_price: item.sale_price,
                    sale_price_start_at: item.sale_price_start_at || "",
                    sale_price_end_at: item.sale_price_end_at || "",
                }
                : { sale_price: item.sale_price };
    
            if (item.isVariant) {
                groupedProducts[productId].variants.push({
                    id: Number(item.key.replace("V-", "")),
                    quantity: item.quantity,
                    price: item.price,
                    sell_price: item.sell_price,
                    ...salePriceData, // Thêm sale_price và 2 ngày nếu có
                });
            } else {
                groupedProducts[productId] = {
                    id: Number(productId),
                    quantity: item.quantity,
                    price: item.price,
                    sell_price: item.sell_price,
                    ...salePriceData, // Thêm sale_price và 2 ngày nếu có
                };
            }
        });
    
        const payload = {
            status: status,
            reason: "Nhập hàng bổ sung",
            products: Object.values(groupedProducts),
        };
    
        console.log("Dữ liệu gửi đi:", JSON.stringify(payload, null, 2));
    
        try {
            await productsServices.confirm(selectedStock.id, payload);
    
            if (showNotification) {
                notification.success({
                    message: `Đơn nhập hàng đã được ${status === -1 ? "hủy" : "hoàn thành"}!`,
                });
            }
    
            setIsModalVisible(false);
            setSelectedStock(null);
            setConfirmStatus(null);
            refetchStocks();
        } catch (error) {
            console.error("Lỗi khi xác nhận đơn hàng:", error);
            notification.error({
                message: "Cập nhật thất bại",
                description: "Có lỗi xảy ra khi cập nhật đơn nhập hàng.",
            });
        }
    };

    const handleExportExcel = async () => {
        console.log("Order IDs đã chọn:", selectedRows);
        try {
            // Gọi API để lấy dữ liệu (dùng fetch thay cho service)
            const response = await fetch('http://127.0.0.1:8000/api/export-product-stocks', {
                method: 'POST',  // Nếu API yêu cầu phương thức POST
                headers: {
                    'Content-Type': 'application/json', // Đảm bảo API nhận đúng loại dữ liệu
                },
                body: JSON.stringify({ order_ids: selectedRows }),  // Nếu API yêu cầu truyền dữ liệu như order_ids
            });

            // Kiểm tra nếu API trả về file nhị phân
            const blob = await response.blob();

            // Kiểm tra kích thước của file (optional)
            if (blob.size === 0) {
                throw new Error('File xuất ra rỗng');
            }

            // Tải file Excel về máy người dùng
            saveAs(blob, 'product_stocks.xlsx');

            notification.success({
                message: 'Xuất Excel thành công!',
                description: 'Dữ liệu đã được xuất và tải xuống thành công.',
            });
        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
            notification.error({
                message: 'Xuất Excel thất bại!',
                description: error.message || 'Có lỗi xảy ra khi xuất dữ liệu.',
            });
        }
    };

    // Cột danh sách nhập hàng
    const columns = [
        {
            title: (
                <Checkbox
                    onChange={(e) => {
                        setSelectedRows(e.target.checked ? adjustedStocks.map((stock) => stock.id) : []);
                    }}
                    checked={selectedRows.length === adjustedStocks?.length}
                />
            ),
            dataIndex: "checkbox",
            render: (_, record) => (
                <Checkbox
                    checked={selectedRows.includes(record.id)}
                    onChange={(e) => {
                        const newSelectedRows = e.target.checked
                            ? [...selectedRows, record.id]
                            : selectedRows.filter((id) => id !== record.id);
                        setSelectedRows(newSelectedRows);
                    }}
                />
            ),
            align: "center",
        },
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
            align: "center",
        },
        {
            title: "Ngày nhập hàng",
            dataIndex: "ngaytao",
            key: "ngaytao",
            render: (ngaytao) => (ngaytao ? dayjs(ngaytao).format("DD/MM/YYYY") : ""),
            align: "center",
            sorter: (a, b) => dayjs(a.ngaytao).unix() - dayjs(b.ngaytao).unix(),
        },
        {
            title: "Người nhập hàng",
            dataIndex: "created_by",
            key: "created_by",
            align: "center",
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (status) => {
                let statusText = "Chờ xác nhận";
                let statusClass = "action-link-blue";

                if (status === -1) {
                    statusText = "Đã hủy";
                    statusClass = "action-link-red";
                } else if (status === 1) {
                    statusText = "Hoàn thành";
                    statusClass = "action-link-green";
                }

                return <span className={statusClass}>{statusText}</span>;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, record) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            type='link'
                            onClick={() => handleShow(record)}
                        />
                    </Tooltip>

                    {!(record.status === -1 || record.status === 1 || loggedInUserRole === 'manager') && (
                        <Tooltip title="Cập nhật">
                            <Button
                                color="primary"
                                variant="solid"
                                icon={<EditOutlined />}
                                type="link"
                                onClick={() => handleShowDetails(record)}
                            />
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    // bảng cập nhật đơn nhập hàng
    const detailColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
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
            render: (price, record) => (
                <Form.Item
                    name={`price_${record.key}`}
                    initialValue={price}
                    rules={
                        confirmStatus === 1
                            ? [
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá nhập!",
                                },
                                {
                                    validator: (_, value) => {
                                        if (Number(value) >= Number(record.sell_price)) {
                                            return Promise.reject("Giá nhập phải nhỏ hơn giá bán!");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]
                            : [] // Không áp dụng rules nếu confirmStatus không phải 1
                    }
                >
                    <InputNumber
                        className="input-form"
                        value={price}
                        formatter={(value) =>
                            value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        }
                        parser={(value) => value?.replace(/\./g, "")}
                        onChange={(value) => handleInputChange(record.key, "price", value)}
                        min={0}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price, record) => (
                <Form.Item
                    name={`sell_price_${record.key}`}
                    initialValue={sell_price}
                    rules={
                        confirmStatus === 1
                            ? [
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá bán!",
                                },
                                {
                                    validator: (_, value) => {
                                        if (Number(value) <= Number(record.price)) {
                                            return Promise.reject("Giá bán phải lớn hơn giá nhập!");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]
                            : [] // Không áp dụng rules nếu confirmStatus không phải 1
                    }
                >
                    <InputNumber
                        className="input-form"
                        value={sell_price}
                        formatter={(value) =>
                            value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        }
                        parser={(value) => value?.replace(/\./g, "")}
                        onChange={(value) => handleInputChange(record.key, "sell_price", value)}
                        min={0}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Giá khuyến mại (VNĐ)",
            dataIndex: "sale_price",
            align: "center",
            render: (sale_price, record) => (
                <Form.Item
                    name={`sale_price_${record.key}`}
                    initialValue={sale_price}
                    rules={
                        confirmStatus === 1
                            ? [
                                {
                                    required: true,
                                    message: "Vui lòng nhập giá khuyến mại!",
                                },
                                {
                                    validator: (_, value) => {
                                        if (value >= record.sell_price) {
                                            return Promise.reject("Giá khuyến mại phải nhỏ hơn giá bán!");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]
                            : [] // Không áp dụng rules nếu confirmStatus không phải 1
                    }
                >
                    <InputNumber
                        className="input-form"
                        value={sale_price}
                        formatter={(value) =>
                            value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        }
                        parser={(value) => value?.replace(/\./g, "")}
                        onChange={(value) => handleInputChange(record.key, "sale_price", value)}
                        min={0}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Ngày mở KM",
            dataIndex: "sale_price_start_at",
            key: "sale_price_start_at",
            align: "center",
            render: (sale_price_start_at, record) => {
                return (
                    <Form.Item
                        name={`sale_price_start_at_${record.key}`}
                        initialValue={sale_price_start_at ? dayjs(sale_price_start_at) : null}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const salePrice = getFieldValue(`sale_price_${record.key}`);
                                    if (!salePrice) {
                                        return Promise.resolve();
                                    }
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
                            value={sale_price_start_at ? dayjs(sale_price_start_at) : null}
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
            render: (sale_price_end_at, record) => {
                return (
                    <Form.Item
                        name={`sale_price_end_at_${record.key}`}
                        initialValue={sale_price_end_at ? dayjs(sale_price_end_at) : null}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const salePrice = getFieldValue(`sale_price_${record.key}`);
                                    const startDate = getFieldValue(`sale_price_start_at_${record.key}`);
                                    if (!salePrice) {
                                        return Promise.resolve();
                                    }
                                    if (!startDate) {
                                        return Promise.resolve();
                                    }
                                    if (!value) {
                                        return Promise.reject("Vui lòng chọn ngày đóng khuyến mại!");
                                    }
                                    if (value && startDate && value.isSame(startDate, 'day')) {
                                        return Promise.reject("Ngày đóng không được trùng ngày mở!");
                                    }
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
                            value={sale_price_end_at ? dayjs(sale_price_end_at) : null}
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
            render: (quantity, record) => (
                <Form.Item
                    name={`quantity_${record.key}`}
                    initialValue={quantity}
                    rules={
                        confirmStatus === 1
                            ? [
                                {
                                    required: true,
                                    message: "Vui lòng nhập số lượng!",
                                },
                                {
                                    type: "number",
                                    min: 1,
                                    message: "Số lượng phải lớn hơn 0!",
                                },
                            ]
                            : [] // Không áp dụng rules nếu confirmStatus không phải 1
                    }
                >
                    <InputNumber
                        className="input-form"
                        value={quantity}
                        min={1}
                        onChange={(value) => handleInputChange(record.key, "quantity", value)}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Tổng tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatPrice(record.price * record.quantity),
        },
    ];

    // bảng chi tiết đơn nhập hàng
    const modalcolumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            align: "center",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Giá nhập (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
        },
        {
            title: "Giá KM (VNĐ)",
            dataIndex: "sale_price",
            align: "center",
            render: (sale_price) => (sale_price ? formatPrice(sale_price) : ""),
        },
        {
            title: "Ngày mở KM",
            dataIndex: "sale_price_start_at",
            align: "center",
            render: (sale_price_start_at) => sale_price_start_at ? dayjs(sale_price_start_at).format("DD/MM/YYYY") : null
        },
        {
            title: "Ngày đóng KM",
            dataIndex: "sale_price_end_at",
            align: "center",
            render: (sale_price_end_at) => sale_price_end_at ? dayjs(sale_price_end_at).format("DD/MM/YYYY") : null,
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
                <ImportOutlined style={{ marginRight: "8px" }} />
                Lịch sử nhập hàng
            </h1>

            <div className="group1">
                <div className="group1">
                    <ConfigProvider locale={viVN}>
                        <RangePicker
                            onChange={(dates) => setDateRange(dates && dates.length === 2 ? dates : [null, null])}
                            format="DD-MM-YYYY"
                            placeholder={["Từ ngày", "Đến ngày"]}
                        />
                    </ConfigProvider>

                    <Select
                        placeholder="Trạng thái"
                        className="select-item"
                        allowClear
                        value={filterStatus}
                        onChange={(value) => setFilterStatus(value ?? null)}
                    >
                        <Select.Option value={-1}>Đã hủy</Select.Option>
                        <Select.Option value={0}>Chờ xác nhận</Select.Option>
                        <Select.Option value={1}>Hoàn thành</Select.Option>
                    </Select>
                </div>

                <div className="group2">

                    <Upload
                        beforeUpload={(file) => {
                            const isExcel =
                                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                                file.type === 'application/vnd.ms-excel';
                            if (!isExcel) {
                                notification.error({
                                    message: 'Lỗi định dạng file',
                                    description: 'Vui lòng chọn file Excel (.xlsx hoặc .xls)!',
                                });
                                return Upload.LIST_IGNORE;
                            }

                            const maxSize = 10 * 1024 * 1024; // 10MB
                            if (file.size > maxSize) {
                                notification.error({
                                    message: 'Lỗi kích thước file',
                                    description: 'File không được lớn hơn 10MB!',
                                });
                                return Upload.LIST_IGNORE;
                            }

                            return true;
                        }}
                        customRequest={async ({ file, onSuccess, onError }) => {
                            try {
                                const formData = new FormData();
                                formData.append('file', file);

                                const response = await productsServices.importExcel(formData);

                                if (response.success) {
                                    notification.success({
                                        message: 'Nhập Excel thành công!',
                                        description: response.message || 'Dữ liệu đã được nhập vào hệ thống.',
                                    });
                                    refetchStocks();
                                    onSuccess(response);
                                } else {
                                    throw new Error(response.message || 'Phản hồi từ server không thành công');
                                }
                            } catch (error) {
                                console.error("Lỗi khi nhập Excel:", error);
                                notification.error({
                                    message: 'Nhập Excel thất bại!',
                                    description:
                                        error.response?.data?.message ||
                                        error.message ||
                                        'Có lỗi xảy ra khi nhập dữ liệu từ file Excel.',
                                });
                                onError(error);
                            }
                        }}
                        showUploadList={false}
                    >
                        <Button color="primary" variant="solid" icon={<ImportOutlined />}>
                            Nhập Excel
                        </Button>
                    </Upload>

                    <Button
                        color="primary" variant="solid"
                        icon={<ToTopOutlined />}
                        onClick={handleExportExcel}
                    >
                        Xuất Excel
                    </Button>

                    <Link to="/admin/import">
                        <Button
                            color="primary" variant="solid"
                            icon={<ImportOutlined />}
                        >
                            Nhập hàng
                        </Button>
                    </Link>
                </div>
            </div>

            <Skeleton active loading={isProductsLoading}>
                <Table
                    columns={columns}
                    dataSource={adjustedStocks}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                    }}
                    bordered
                />
            </Skeleton>

            <Modal
                title="Xác nhận nhập hàng"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1200}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleConfirm}  // Form đã gọi handleConfirm
                >
                    <Table
                        columns={detailColumns}
                        dataSource={modalData}
                        rowKey="key"
                        pagination={false}
                        bordered
                        summary={() => {
                            const totalAmount = modalData.reduce(
                                (sum, item) => sum + (parseFloat(item.total) || 0),
                                0
                            );
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={8} align="right">
                                        <strong>Tổng giá trị (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(totalAmount.toFixed(0))}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />

                    <div className="add">
                        <Select
                            style={{ marginRight: '10px' }}
                            placeholder="Trạng thái"
                            className="select-item"
                            value={confirmStatus}
                            onChange={(value) => setConfirmStatus(value)} // Lưu đúng giá trị vào confirmStatus
                        >
                            <Select.Option value={-1}><span className='action-link-red'>Hủy</span></Select.Option>
                            <Select.Option value={0}><span className='action-link-blue'>Chờ xác nhận</span></Select.Option>
                            <Select.Option value={1}><span className='action-link-green'>Hoàn thành</span></Select.Option>
                        </Select>

                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Chi tiết đơn nhập hàng"
                visible={detailModal}
                onCancel={() => setDetailModal(false)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={modalcolumns}
                    dataSource={getModalDataSource()}
                    rowKey="key"  // Đảm bảo mỗi hàng có key duy nhất
                    pagination={false}
                    bordered
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={8} align="right">
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