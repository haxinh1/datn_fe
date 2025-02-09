import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Pagination } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import "./home.css";
import { productsServices } from './../services/product';

const { Meta } = Card;

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await productsServices.fetchProducts();
      return response.data;
    },
  });

  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0, // Không có số thập phân
    });
    return formatter.format(price);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = products.slice(startIndex, endIndex);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {currentData && currentData.map((p) => (
          <Col span={8} key={p.id}>
            <Link to={`/detail/${p.id}`}>
              <Card
                hoverable
                cover={<img alt={p.name} src={p.thumbnail} className="product-image" />}
                className="product-card"
              >
                <Meta 
                  title={p.name} 
                  description={`Giá niêm yết: ${formatPrice(p.sell_price)} VNĐ`} 
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={products?.length || 0}   
        style={{ marginTop: '20px', float: 'right' }}
      />
    </>
  );
};

export default Home;