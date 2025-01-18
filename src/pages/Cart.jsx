import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Image, Typography, message, Modal } from "antd";
import { CreditCardOutlined, DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    const fetchProducts = async () => {
      try {
        const productData = await fetch("http://localhost:3000/products"); 
        const result = await productData.json();
        setProducts(result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  const checkQuantity = (productId, quantity) => {
    const product = products.find((item) => item.id === productId);
    if (product && product.quantity < quantity) {
      message.error(`Sản phẩm ${product.name} chỉ còn ${product.quantity} chiếc, không thể thanh toán!`);
      return false;
    }
    return true;
  };

  const updateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const confirmRemoveItem = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => removeItem(id),
    });
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    message.success("Sản phẩm đã được xóa khỏi giỏ hàng!");
  };

  const handleCheckout = () => {
    for (let item of cartItems) {
      if (!checkQuantity(item.id, item.quantity)) {
        return; 
      }
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => <Image width={100} src={imageUrl}/>,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.id, value)}
        />
      ),
    },
    {
      title: "Tổng cộng (VNĐ)",
      key: "total",
      render: (_, record) => (
        <Typography.Text strong>
          {(record.price * record.quantity).toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => confirmRemoveItem(record.id)}
        >
          Xóa khỏi giỏ hàng
        </Button>
      ),
    },
  ];

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: "#E67E22" }} className="mb-5">
        <ShoppingCartOutlined style={{ marginRight: '8px' }} />
        Giỏ hàng của bạn
      </h1>
      <Table
        columns={columns}
        dataSource={cartItems}
        rowKey="id"
        pagination={false}
        summary={() => (
          <>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '5rem' }}>
                Tổng thanh toán
              </Table.Summary.Cell>

              <Table.Summary.Cell style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#E67E22', textAlign: 'center' }}>
                {totalAmount.toLocaleString()} VNĐ
              </Table.Summary.Cell>

              <Table.Summary.Cell style={{ textAlign: 'left' }}>
                <Link to='/pay'>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CreditCardOutlined />}
                    onClick={handleCheckout}
                    style={{ backgroundColor: "#E67E22", color: "#fff" }}
                  >
                    Thanh toán
                  </Button>
                </Link>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </>
        )}
      />
    </div>
  );
};

export default Cart;
