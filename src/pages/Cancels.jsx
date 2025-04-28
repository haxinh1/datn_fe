import { CloseCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Image, Skeleton, Table, Tooltip } from "antd";
import React, { useState } from "react";
import { OrderService } from "../services/order";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "../css/bill.css";
import { useParams } from "react-router-dom";

const Cancels = () => {
    const {id} = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    
    const { data: cancels = [], isLoading } = useQuery({
        queryKey: ["cancels", id],
        queryFn: async () => {
            const response = await OrderService.getCancelByUser(id);
            return Array.isArray(response.order_cancels) ? response.order_cancels : [];
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

    const getReturnReason = (note) => {
        switch (note) {
            case "mistake":
                return "Đặt nhầm sản phẩm";
            case "better":
                return "Tìm thấy ưu đãi tốt hơn";
            case "size_change":
                return "Đổi size/màu";
            case "error":
                return "Sản phẩm bị hư, hỏng khi vận chuyển";
            case "disconnect":
                return "Không thể liên hệ với người đặt";
            case "other":
                return "Khác";
            default:
                return note || "";
        }
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
            dataIndex: "order",
            key: "order",
            align: "center",
            render: (order) => order?.code ?? "", // hoặc order?.code nếu BE trả code
        },
        {
            title: "Lý do hủy đơn",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason)
        },
        {
            title: "Ngày hủy",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) => created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
        },
        {
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "order",
            key: "order_total_amount",
            align: "center",
            render: (order) => order?.total_amount ? formatPrice(order.total_amount) : "",
        },
        {
            title: "Xác nhận hoàn tiền",
            dataIndex: "refund_proof",
            key: "refund_proof",
            align: "center",
            render: (_, item) => {
                return item.refund_proof ? (
                    <Image width={60} src={item.refund_proof} />
                ) : null;
            },
        },
        // {
        //     title: "",
        //     key: "action",
        //     align: "center",
        //     render: (_, item) => (
        //         <div className="action-container">
        //             <Tooltip title="Xem hóa đơn">
        //                 <Button
        //                     color="primary"
        //                     variant="solid"
        //                     icon={<PrinterOutlined />}
        //                 />
        //             </Tooltip>
        //         </div>
        //     ),
        // },
    ];

    return (
        <div>
            <h1 className="mb-5" style={{ color: '#eea287' }}>
                <CloseCircleOutlined style={{ marginRight: "8px" }} />
                Đơn hủy
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={cancels}
                    pagination={{ pageSize: 5, current: currentPage }}
                    rowKey="id"
                    onChange={(pagination) => setCurrentPage(pagination.current)}
                />
            </Skeleton>
        </div>
    );
};

export default Cancels;