import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Pagination } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import "./home.css";

const { Meta } = Card;

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/products`);
      return response.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        {currentData.map((p) => (
          <Col span={8} key={p.id}>
            <Link to={`/detail/${p.id}`}>
              <Card
                hoverable
                cover={<img alt={p.name} src={p.imageUrl} className="product-image" />}
                className="product-card"
              >
                <Meta title={p.name} description={`Giá niêm yết: ${p.price} VNĐ`} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data.length}
        onChange={handleChangePage}
        style={{ marginTop: '20px', float: 'right' }}
      />
    </>
  );
};

export default Home;
