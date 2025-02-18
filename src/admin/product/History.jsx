import { Button, Table, Modal, Row, DatePicker, ConfigProvider, Form, Select, Input, InputNumber, notification, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { productsServices } from '../../services/product';
import { useQuery } from '@tanstack/react-query';
import { BookOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
import { Link } from 'react-router-dom';

const History = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [dateRange, setDateRange] = useState([null, null]); // ✅ Lưu khoảng ngày chọn
    const { RangePicker } = DatePicker;
    const [filterStatus, setFilterStatus] = useState(null); // ✅ Trạng thái lọc bảng
    const [confirmStatus, setConfirmStatus] = useState(null); // ✅ Trạng thái khi xác nhận trong modal
    const [modalData, setModalData] = useState([]);
    const [form] = Form.useForm();  

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

                    <Tooltip title="Cập nhật">
                        <Button
                            color="primary"
                            variant="solid"
                            icon={<EditOutlined/>}
                            type="link"
                            onClick={() => handleShowDetails(record)}
                            disabled={record.status === -1 || record.status === 1} // ❌ Vô hiệu hóa nếu đã hủy hoặc hoàn thành
                        />
                    </Tooltip>
                </div>
            ),
        },
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
                        sell_price: fullVariant.sell_price ?? "N/A", // ✅ Lấy giá bán từ API
                        sale_price: fullVariant.sale_price ?? "N/A", // ✅ Lấy giá khuyến mại từ API
                        quantity: variant.quantity,
                        total: variant.price * variant.quantity,  // ✅ Tính tổng tiền
                    };
                }).filter(Boolean) // Lọc bỏ null nếu không tìm thấy dữ liệu
                : [{
                    key: index++,  // Đánh số thứ tự đúng
                    name: product.name, // Sản phẩm không có biến thể
                    price: product.price,
                    sell_price: fullProduct.sell_price ?? "N/A", // ✅ Lấy giá bán từ API
                    sale_price: fullProduct.sale_price ?? "N/A", // ✅ Lấy giá khuyến mại từ API
                    quantity: product.quantity,
                    total: product.price * product.quantity,  // ✅ Tính tổng tiền
                }];
        });
    };    

    const handleConfirm = async () => {
        if (!selectedStock) return;
        
        // Kiểm tra xem có đang trong quá trình gửi dữ liệu không để tránh gửi nhiều lần
        if (isModalVisible) {
            // Kiểm tra trạng thái của đơn hàng, nếu đã hoàn thành rồi thì không làm gì nữa
            if (selectedStock.status === confirmStatus) {
                notification.warning({
                    message: "Thông báo",
                    description: "Trạng thái không thay đổi!",
                });
                return;
            }
    
            const groupedProducts = {}; // Nhóm sản phẩm theo ID
        
            modalData.forEach(item => {
                const productId = item.originalProductId || item.key.replace(/^V-|^P-/, ""); 
        
                if (!groupedProducts[productId]) {
                    groupedProducts[productId] = { id: Number(productId), variants: [] };
                }
        
                if (item.isVariant) {
                    groupedProducts[productId].variants.push({
                        id: Number(item.key.replace("V-", "")), 
                        quantity: item.quantity,
                        price: item.price,
                        sell_price: item.sell_price,
                        sale_price: item.sale_price,
                    });
                } else {
                    groupedProducts[productId] = {
                        id: Number(productId),
                        quantity: item.quantity,
                        price: item.price,
                        sell_price: item.sell_price,
                        sale_price: item.sale_price,
                    };
                }
            });
    
            const payload = {
                status: confirmStatus ?? 0, 
                reason: "Nhập hàng bổ sung",
                products: Object.values(groupedProducts) 
            };

            console.log("Dữ liệu gửi đi:", JSON.stringify(payload, null, 2));
    
            try {
                const response = await productsServices.confirm(selectedStock.id, payload);
                if (response) {
                    notification.success({
                        message: "Cập nhật thành công",
                        description: "Đơn nhập hàng đã được cập nhật!",
                    });
    
                    // Đảm bảo chỉ gọi một lần và reset lại mọi thứ
                    setIsModalVisible(false);
                    setSelectedStock(null);
                    setConfirmStatus(null);
                    refetchStocks();
                }
            } catch (error) {
                console.error("Lỗi khi xác nhận đơn hàng:", error);
                notification.error({
                    message: "Cập nhật thất bại",
                    description: "Có lỗi xảy ra khi cập nhật đơn nhập hàng.",
                });
            }
        }
    };   

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
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập giá nhập!",
                        },
                        {
                            validator: (_, value) => {
                                if (value >= record.sell_price) {
                                    return Promise.reject("Giá nhập phải nhỏ hơn giá bán!");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
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
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập giá bán!",
                        },
                        {
                            validator: (_, value) => {
                                if (value <= record.price) {
                                    return Promise.reject("Giá bán phải lớn hơn giá nhập!");
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
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
                    rules={[
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
                    ]}
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
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
            render: (quantity, record) => (
                <Form.Item
                    name={`quantity_${record.key}`}
                    initialValue={quantity}
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập số lượng!",
                        },
                        {
                            type: "number",
                            min: 1,
                            message: "Số lượng phải lớn hơn 0!",
                        },
                    ]}
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
            render: (_, record) => formatPrice(record.price * record.quantity),  // ✅ Hiển thị tổng tiền sau khi chỉnh sửa
        },
    ];   
    
    // bảng chi tiết đơn hàng
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

            <div className="group1">
                <div className="group1">
                    <ConfigProvider locale={viVN}>
                        <RangePicker
                            
                            onChange={(dates) => setDateRange(dates && dates.length === 2 ? dates : [null, null])}
                            format="DD-MM-YYYY"
                            placeholder={["Từ ngày", "Đến ngày"]}
                            style={{ marginRight: 10 }}
                        />
                    </ConfigProvider>

                    <Select
                        placeholder="Trạng thái"
                        className="select-item"
                        showSearch
                        allowClear
                        value={filterStatus}
                        onChange={(value) => setFilterStatus(value ?? null)}
                    >
                        <Select.Option value={-1}>Đã hủy</Select.Option>
                        <Select.Option value={0}>Chờ xác nhận</Select.Option>
                        <Select.Option value={1}>Hoàn thành</Select.Option>
                    </Select>
                </div>

                <Link to="/import" className='group2'>
                    <Button 
                        color="primary" variant="solid" 
                        icon={<PlusOutlined />} 
                    >
                        Nhập hàng
                    </Button>
                </Link>
            </div>

            <Table 
                columns={columns} 
                dataSource={adjustedStocks} 
                rowKey="id"
                loading={isProductsLoading} 
                pagination={{ pageSize: 10 }}
                bordered 
            />

            <Modal
                title="Cập nhật đơn nhập hàng"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1000}
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
                                    <Table.Summary.Cell colSpan={6} align="right">
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
                            <Select.Option value={-1}>Hủy</Select.Option>
                            <Select.Option value={0}>Chờ xác nhận</Select.Option>
                            <Select.Option value={1}>Hoàn thành</Select.Option>
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
                width={800}
            >
                <Table
                    columns={modalcolumns}
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