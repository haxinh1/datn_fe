import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, List, Rate, Input, Button, Image, Row, Col, Table } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";
import formatVND from '../utils/formatPrice';
import ReviewButton from './ProductReview';
import { CommentOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Review = () => {
    const { id } = useParams();
    const [orderReviews, setOrderReviews] = useState(null);

    const reviewColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "product",
            align: "center",
            render: (_, record) => {
                const thumbnail =
                    record.variants?.[0]?.variant_thumbnail || record.thumbnail;
                const productName = record.name || "";
                const variantAttributes =
                    record.variants
                        ?.map((variant) => {
                            const attributes = variant.attributes
                                .map((attr) => attr.attribute_name)
                                .join(" - ");
                            return `${productName} - ${attributes}`;
                        })
                        .join(", ") || productName;
                return (
                    <div style={{ display: "flex", alignItems: "center", justifyContent:'center', gap: "10px" }}>
                        <Image src={thumbnail} width={60} />
                        <Link to={`/product-detail/${record.product_id}`}>
                            <span>{variantAttributes}</span>
                        </Link>
                    </div>
                );
            },
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            align: "center",
            render: (sell_price) => (sell_price ? formatVND(sell_price) : ""),
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
            <h1 className="mb-5" style={{ color: "#eea287" }}>
                <CommentOutlined style={{ marginRight: "8px" }} />
                Đánh giá sản phẩm
            </h1>
            <Table
                columns={reviewColumns}
                dataSource={orderReviews}
                pagination={false}
            />
        </div>
    );
};

export default Review;
