import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Rate, Input, Button, Image, Row, Col, Table } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import formatVND from '../utils/formatPrice';
import ReviewButton from './ProductReview';

const { TextArea } = Input;

const Review = () => {
    const { id } = useParams();
    const [orderReviews, setOrderReviews] = useState(null);

    const reviewColumns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Sản phẩm",
            dataIndex: "name",
            key: "name",

        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            align: "center",
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatVND(sell_price) : ""),
        },
        {
            title: "Tổng tiền (VNĐ)",
            dataIndex: "total",
            align: "center",
            render: (_, record) => formatVND(record.quantity * record.sell_price),
        },
        {
            title: "Đánh giá",
            dataIndex: "review",
            align: "center",
            render: (_, record) => (
                <ReviewButton product={record} orderId={id} />
            ),
        }
    ];
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getOrderById(id);

                setOrderReviews(data);

            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchOrder();
    }, [id]);


    return (
        <div>
            <main className="main">
                <div className="page-header text-center" style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}>
                    <div className="container">
                        <h1 className="page-title">Đánh Giá</h1>
                    </div>
                </div>
                <Table
                    columns={reviewColumns}
                    dataSource={orderReviews}
                    pagination={false}
                />
            </main>
        </div>
    );
};

export default Review;
