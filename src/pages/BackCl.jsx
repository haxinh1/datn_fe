import React, { useEffect, useState } from 'react';
import { Button, Modal, Table, Tooltip, Image, Skeleton, Input } from 'antd';
import { OrderService } from '../services/order';
import { Link, useParams } from 'react-router-dom';
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { render } from 'react-dom';

const BackCl = () => {
    const { id } = useParams();
    const [returns, setReturns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const hideModal = () => setIsModalVisible(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refundDetails, setRefundDetails] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await OrderService.getOrderReturnByIdUser(id);
                if (response?.order_returns && Array.isArray(response.order_returns)) {
                    setReturns(response.order_returns);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng hoàn trả:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = async (keyword) => {
        setIsLoading(true);
        try {
            if (keyword.trim()) {
                const response = await OrderService.searchOrderReturn(keyword);
                setReturns(response); // hoặc response.order_returns nếu API trả vậy
            } else {
                const response = await OrderService.getOrderReturnByIdUser(id);
                setReturns(response.order_returns);
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch(searchKeyword);
        }, 300); // 500ms debounce

        return () => clearTimeout(delayDebounce);
    }, [searchKeyword]);

    const dataSource = returns.map((item, index) => ({
        key: item.order_id, // quan trọng cho Table
        index: index + 1,
        code: item.order.code,
        fullname: item.order.fullname,
        phone_number: item.order.phone_number,
        total_amount: item.order.total_amount,
        created_at: item.order.created_at,
        payment: { id: item.order.payment_id, name: item.order.payment_id === 1 ? "COD" : "VNPAY" },
        status_id: item.order.status_id,
        reason: item.reason,
        employee_evidence: item.employee_evidence,
        refund_proof: item.refund_proof,
        total_refund_amount: item.total_refund_amount,
        order_id: item.order_id,
        products: item.products || [],
    }));

    const fetchReturnDetails = async (orderId) => {
        try {
            const response = await OrderService.getReturn(orderId);
            const refundData = response?.order_return;
            console.log("Dữ liệu từ fetchReturnDetails:", refundData);
            setRefundDetails(refundData);
            return refundData;
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
            return null;
        }
    };

    const showModal = async (item) => {
        setIsModalVisible(true);
        try {
            const refundData = await fetchReturnDetails(item.order_id);
            setSelectedProducts(refundData?.products || []);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            notification.error({
                message: "Lỗi hiển thị chi tiết",
                description: "Không thể tải chi tiết đơn hàng.",
            });
            setSelectedProducts([]);
        }
    };

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data;
        },
    });

    const getReturnReason = (note) => {
        switch (note) {
            case "store_error":
                return "Cửa hàng gửi sai, thiếu sản phẩm";
            case "damaged":
                return "Sản phẩm có dấu hiệu hư hỏng";
            case "misdescription":
                return "Sản phẩm khác với mô tả";
            case "size_change":
                return "Tôi muốn đổi size";
            case "other":
                return "Khác";
            default:
                return note || "";
        }
    };

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
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => (currentPage - 1) * 5 + index + 1,
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "code",
            key: "code",
            align: "center",
        },
        {
            title: "Lý do trả hàng",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason),
        },
        {
            title: "Số tiền (VNĐ)",
            dataIndex: "total_refund_amount",
            key: "total_refund_amount",
            align: "center",
            render: (total_refund_amount) => (total_refund_amount ? formatPrice(total_refund_amount) : ""),
        },
        {
            title: "Shop xác nhận hoàn tiền",
            dataIndex: "refund_proof",
            key: "refund_proof",
            align: "center",
            render: (_, item) => {
                return item.refund_proof ? (
                    <Image width={60} src={item.refund_proof} />
                ) : null;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            align: "center",
            render: (_, record) => {
                const statusName = statusData?.find(s => s.id === record.status_id)?.name || "";
                const statusColorClass = [8, 9, 11].includes(record.status_id) ? "action-link-red" : "action-link-blue";

                return <div className={statusColorClass}>{statusName}</div>;
            },
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Tooltip title="Chi tiết">
                        <Button
                            color="purple"
                            variant="solid"
                            icon={<EyeOutlined />}
                            onClick={() => showModal(item)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    const detailColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "name",
            align: "center",
            render: (text, record) => {
                const productName = record.name;
                const attributes = record.attributes
                    ? record.attributes.map(attr => attr.attribute_name).join(" - ")
                    : "";

                const thumbnail = record.thumbnail;  // Lấy ảnh sản phẩm

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image width={90} src={thumbnail} />
                        <Link to={`/product-detail/${record.id}`}>
                            <span>{`${productName} ${attributes ? `- ${attributes}` : ""}`}</span>
                        </Link>
                    </div>
                );
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Giá hoàn (VNĐ)",
            dataIndex: "price",
            align: "center",
            render: (price) => (price ? formatPrice(price) : ""),
        },
        {
            title: "Thành tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatPrice(record.quantity * record.price),
        },
    ];

    return (
        <div>
            <h1 className="mb-5" style={{ color: '#eea287' }}>
                <RollbackOutlined style={{ marginRight: "8px" }} />
                Đơn hàng hoàn trả
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", }}>
                <Input
                    style={{ width: '400px' }}
                    placeholder="Tìm kiếm mã đơn hàng..."
                    allowClear
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                />
            </div>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={dataSource.length > 0 ? dataSource : []}
                    pagination={{ pageSize: 5, current: currentPage }}
                    onChange={(pagination) => setCurrentPage(pagination.current)}
                />
            </Skeleton>

            <Modal
                title="Chi tiết đơn hoàn trả"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={700}
            >
                <div className="group1">
                    <Table
                        columns={detailColumns}
                        dataSource={selectedProducts.map((product, index) => ({
                            key: index,
                            index: index + 1,
                            name: product.name,
                            thumbnail: product.thumbnail,
                            attributes: product.attributes, 
                            quantity: product.quantity || 0,
                            price: product.price || 0,
                            total: (product.quantity || 0) * (product.price || 0), // Tính thành tiền
                        }))}
                        pagination={false}
                        summary={() => {
                            const totalAmount = selectedProducts.reduce(
                                (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
                                0
                            );
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={4} align="right">
                                        <strong>Số tiền hoàn trả (VNĐ):</strong>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell align="center">
                                        <strong>{formatPrice(totalAmount)}</strong>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default BackCl;
