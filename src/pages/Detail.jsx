import React, { useEffect, useState } from "react";
import api from "../axios";
import { useParams } from "react-router-dom";
import { Descriptions, Row, Col, Image, Button, message } from 'antd';
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import './detail.css'; 

const Detail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleMinus = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handlePlus = () => setQuantity((prev) => prev + 1);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      message.error("Số lượng yêu cầu vượt quá số lượng sản phẩm hiện có!");
    } else {
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
  
      if (existingItemIndex >= 0) {
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        cartItems.push({ ...product, quantity });
      }
  
      localStorage.setItem('cart', JSON.stringify(cartItems));
      message.success("Sản phẩm đã được thêm vào giỏ hàng!");
    }
  };  

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color:"gray" }} className="mb-5"> 
        <EyeOutlined style={{ marginRight: '8px' }} />Chi tiết sản phẩm
      </h1>
      <Row gutter={16} align="middle">
        <Col span={12} className="product-image-container">
          <Image
            width={400} 
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            placeholder={<Image preview={false} src="fallback-image-url" width={400} />}
          />
        </Col>

        <Col span={12}>
          <Descriptions title="Thông tin sản phẩm" bordered column={1}>
            <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
            <Descriptions.Item label="Giá niêm yết">{product.price} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{product.description}</Descriptions.Item>
            <Descriptions.Item label="Số lượng tại cửa hàng">{product.quantity}</Descriptions.Item>
          </Descriptions>

          <div className="soluong">
            <button className="minus-btn" onClick={handleMinus}>-</button>
            <input
              type="text"
              name="amount"
              id="amount"
              value={quantity}
              readOnly
            />
            <button className="plus-btn" onClick={handlePlus}>+</button>
          </div>

          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            size="large"
            onClick={handleAddToCart}
            style={{ backgroundColor: '#E67E22', padding: '10px 20px', fontSize: '16px', marginTop:"20px" }}
          >
            Thêm vào giỏ hàng
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Detail;
