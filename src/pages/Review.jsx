import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Rate, Input, Button, Image, Row, Col } from 'antd';
import { OrderService } from '../services/order';
import "../css/review.css";

const { TextArea } = Input;

const Review = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [reviews, setReviews] = useState({}); // Lưu đánh giá của từng sản phẩm

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await OrderService.getDetailOrder(id);
                setOrder(data.order);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            }
        };
        fetchOrder();
    }, [id]);

    const handleReviewChange = (productId, field, value) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const handleSubmit = () => {
        console.log("Danh sách đánh giá đã gửi:", reviews);
        // Gửi dữ liệu lên server tại đây nếu cần
    };

    return (
        <div>
            <main className="main">
                <div className="page-header text-center" style={{ backgroundImage: "url('assets/images/page-header-bg.jpg')" }}>
                    <div className="container">
                        <h1 className="page-title">Đánh Giá</h1>
                    </div>
                </div>
                <div className="page-content">
                    <div className="container">
                        {order &&
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: order.order_items.length === 1 ? 'center' : 'space-between' }}>
                                {order.order_items.map(({ product }) => (
                                    <Card key={product.id} className='review-card'>
                                        <Row gutter={24}>
                                            <Col span={12}>
                                                <Image src={product.thumbnail} alt={product.name} width={150} height={200} />
                                            </Col>
                                            <Col span={12}>
                                                <h3 className="product-name">{product.name}</h3>
                                                <span className='text-ask'>{parseInt(product.sell_price).toLocaleString()} VNĐ</span>
                                                <span className='rating'>Đánh giá sao</span>
                                                <Rate
                                                    onChange={value => handleReviewChange(product.id, 'rating', value)}
                                                    value={reviews[product.id]?.rating || 0}
                                                />
                                            </Col>
                                        </Row>

                                        <TextArea
                                            rows={3}
                                            className='input-item'
                                            placeholder="Nhập đánh giá của bạn..."
                                            onChange={e => handleReviewChange(product.id, 'comment', e.target.value)}
                                            value={reviews[product.id]?.comment || ''}
                                            style={{ marginTop: 8 }}
                                        />
                                    </Card>
                                ))}
                            </div>
                        }
                        <div className="add">
                            <Button onClick={handleSubmit} className='button-item'>Gửi đánh giá</Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Review;
