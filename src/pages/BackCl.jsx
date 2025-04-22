import React, { useEffect, useState } from 'react';
import { Button, Modal, Table, Tooltip, Image, Skeleton, Input, notification } from 'antd'; // Thêm notification
import { OrderService } from '../services/order';
import { Link, useParams } from 'react-router-dom';
import { EyeOutlined, RollbackOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import echo from '../echo'; // Thêm import echo

const BackCl = () => {
    const { id } = useParams();
    const [returns, setReturns] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const hideModal = () => setIsModalVisible(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refundDetails, setRefundDetails] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    // Fetch dữ liệu ban đầu
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

    useEffect(() => {
        fetchData();

        // Lắng nghe sự kiện OrderReturnStatusUpdated
        const channel = echo.channel('order-return-status-channel');
        channel.listen('.order-return-status-updated', (event) => {
            console.log('Sự kiện OrderReturnStatusUpdated:', event);

            // Cập nhật danh sách returns
            setReturns((prevReturns) => {
                const updatedReturns = prevReturns.map((item) => {
                    if (item.order_id === event.order_id) {
                        return {
                            ...item,
                            order: {
                                ...item.order,
                                status_id: event.status_id,
                                updated_at: event.updated_at,
                            },
                            note: event.note || item.note,
                        };
                    }
                    return item;
                });
                return updatedReturns;
            });

            // Hiển thị thông báo (tùy chọn)
            notification.info({
                message: 'Cập nhật trạng thái đơn hàng',
                description: `Đơn hàng ${event.order_id} đã được cập nhật trạng thái.`,
            });
        });

        // Cleanup khi component unmount
        return () => {
            channel.stopListening('.order-return-status-updated');
            echo.leaveChannel('order-return-status-channel');
        };
    }, [id]); // Thêm id vào dependencies để fetch lại dữ liệu khi id thay đổi

    // Debounce search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch(searchKeyword);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchKeyword]);

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

    const dataSource = returns.map((item, index) => ({
        key: item.order_id,
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
        raw: item,
    }));

    const fetchReturnDetails = async (orderId) => {
        try {
            const response = await OrderService.getReturn(orderId);
            setRefundDetails(response?.refund_details?.[0]);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
        }
    };

    const showModal = (item) => {
        setIsModalVisible(true);
        setSelectedProducts(item.raw.products || []);
        fetchReturnDetails(item.raw.order_id);
    };

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
            render: (_, __, index) => index + 1,
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
                const thumbnail = record.thumbnail;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image width={60} src={thumbnail} />
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
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
                    pagination={{ pageSize: 5 }}
                />
            </Skeleton>

            <Modal
                title="Chi tiết đơn hoàn trả"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                width={800}
            >
                <div className="group1">
                    <Table
                        columns={detailColumns}
                        dataSource={selectedProducts.map((product, index) => ({
                            ...product,
                            key: index,
                            index: index + 1,
                            price: product.price,
                            id: product.product_id,
                        }))}
                        pagination={false}
                        summary={() => {
                            const totalAmount = selectedProducts.reduce(
                                (sum, item) => sum + item.quantity * item.price,
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
};

export default BackCl;