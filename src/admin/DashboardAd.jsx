import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, List, Typography, Table, Spin, Row, Col } from "antd";
import { statisticServices } from "../services/statisticServices";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { DatabaseOutlined } from "@ant-design/icons";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [expensesData, setExpensesData] = useState({ datasets: [], labels: [] });
  const [topUsers, setTopUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatistics, setOrderStatistics] = useState([]);
  const [revenueStatistics, setRevenueStatistics] = useState({});
  const [topRevenueDays, setTopRevenueDays] = useState([]);
  const [topView, setTopView] = useState([]);
  const [topBuy, setTopBuy] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenueStatistics = async () => {
      const data = await statisticServices.fetchRevenueStatistics();
      const labels = data.statistics.map((item) => item.date);
      const cancelledOrders = data.statistics.map((item) => Number(item.cancelled_orders) || 0);
      const returnedOrders = data.statistics.map((item) => Number(item.returned_orders) || 0);
      setExpensesData({
        labels,
        datasets: [
          {
            label: "Hoàn",
            data: returnedOrders,
            borderColor: "green",
            fill: true,
          },
          {
            label: "Hủy",
            data: cancelledOrders,
            borderColor: "blue",
            fill: true,
          },
        ],
      });
      setRevenueStatistics(data);
    };

    const fetchAll = async () => {
      await fetchRevenueStatistics();
      const [topU, topP, orderS, topR, buyView, revDay] = await Promise.all([
        statisticServices.fetchTopUserBought(),
        statisticServices.fetchTopProductBought(),
        statisticServices.fetchOrderStatistics(),
        statisticServices.fetchTopRevenueDays(),
        statisticServices.fetchTopBuyView(),
        statisticServices.fetchRevenue(),
      ]);
      setTopUsers(topU.datas || []);
      setTopProducts(topP.datas || []);
      setOrderStatistics(orderS.orderStats || []);
      setTopRevenueDays(topR.topDays || []);
      setTopBuy(buyView.dataBuy || []);
      setTopView(buyView.dataView || []);
      setRevenueByDay(revDay.revenue || []);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) return <Spin fullscreen />;

  const formatDate = (str) => new Date(str).toLocaleDateString("en-GB");

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  return (
    <div >
      <h1 className="mb-5">
        <DatabaseOutlined style={{ marginRight: "8px" }} />
        Tổng hợp thống kê
      </h1>

      <Row gutter={24}>
        <Col span={8}>
          <Card style={{marginBottom: "20px"}}>
            <h1 className="mb-5">Doanh thu</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={revenueByDay.slice(0, 3).map((item, index) => ({
                key: index,
                date: formatDate(item.date),
                revenue: formatPrice(item.revenue) + " VNĐ",
              }))}
              columns={[
                {
                  title: "Ngày",
                  dataIndex: "date",
                  key: "date",
                  align: "center",
                },
                {
                  title: "Doanh thu",
                  dataIndex: "revenue",
                  key: "revenue",
                  align: "center",
                },
              ]}
            />
          </Card>

          <Card style={{marginBottom: "20px"}}>
            <h1 className="mb-5">Khách hàng</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={topUsers.map((user, index) => ({
                key: index,
                fullname: user.fullname,
                total_quantity: user.total_quantity,
              }))}
              columns={[
                {
                  title: "Khách hàng",
                  dataIndex: "fullname",
                  key: "fullname",
                  align: "center",
                },
                {
                  title: "Số lượng sản phẩm",
                  dataIndex: "total_quantity",
                  key: "total_quantity",
                  align: "center",
                  sorter: (a, b) => a.quantity - b.quantity,
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{marginBottom: "20px"}}>
            <h1 className="mb-5">Lượt bán sản phẩm</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={topProducts.map((item, index) => ({
                key: index,
                name: item.name,
                quantity: item.quantity,
              }))}
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "name",
                  key: "name",
                  align: "center",
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "center",
                  sorter: (a, b) => a.quantity - b.quantity,
                },
              ]}
            />
          </Card>

          <Card style={{marginBottom: "20px"}}>
            <h1 className="mb-5">Lượt xem sản phẩm</h1>
            <Table
              size="small"
              dataSource={topView}
              rowKey="name"
              pagination={false}
              bordered
              columns={[
                {
                  title: "Sản phẩm",
                  dataIndex: "name",
                  align: "center",
                },
                {
                  title: "Lượt xem",
                  dataIndex: "views",
                  align: "center",
                  sorter: (a, b) => a.views - b.views,
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{marginBottom: "20px"}}>
            <h1 className="mb-5">Đơn hàng</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={orderStatistics.map((item, index) => ({
                key: index,
                status_name: item.status_name,
                total_orders: item.total_orders,
              }))}
              columns={[
                {
                  title: "Trạng thái",
                  dataIndex: "status_name",
                  key: "status_name",
                  align: "center",
                },
                {
                  title: "Số lượng đơn",
                  dataIndex: "total_orders",
                  key: "total_orders",
                  align: "center",
                  sorter: (a, b) => a.total_orders - b.total_orders,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <h1 className="mb-5">Biểu đồ hoàn hủy</h1>
        <Line data={expensesData} />
      </Card>


      {/* <Col span={12}>
          <Card title="Top sản phẩm được mua">
            <Table
              size="small"
              dataSource={topBuy}
              rowKey="name"
              pagination={false}
              columns={[
                { title: "Tên sản phẩm", dataIndex: "name" },
                { title: "Lượt mua", dataIndex: "total_sold" },
              ]}
            />
          </Card>
        </Col> */}

      {/* <Card title="Top doanh thu" style={{ marginTop: 16 }}>
        <List
          size="small"
          dataSource={topRevenueDays}
          renderItem={(item) => (
            <List.Item>
              {formatDate(item.date)} {item.total_revenue} VNĐ
            </List.Item>
          )}
        />
      </Card> */}
    </div>
  );
};

export default Dashboard;
