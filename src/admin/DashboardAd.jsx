import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, Table, Spin, Row, Col, Avatar } from "antd";
import { UserOutlined, DatabaseOutlined } from "@ant-design/icons";
import { statisticServices } from "../services/statisticServices";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [expensesData, setExpensesData] = useState({
    datasets: [],
    labels: [],
  });
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
      const cancelledOrders = data.statistics.map(
        (item) => Math.floor(Number(item.cancelled_orders)) || 0 // Đảm bảo số nguyên
      );
      const returnedOrders = data.statistics.map(
        (item) => Math.floor(Number(item.returned_orders)) || 0 // Đảm bảo số nguyên
      );
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

  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const orderStats = [
    { status_name: "Chờ thanh toán", total_orders: 1 },
    { status_name: "Đã thanh toán trực tuyến", total_orders: 0 },
    { status_name: "Đang xử lý", total_orders: 1 },
    { status_name: "Đang giao hàng", total_orders: 0 },
    { status_name: "Đã giao hàng", total_orders: 0 },
    { status_name: "Giao hàng thất bại", total_orders: 0 },
    { status_name: "Hoàn thành", total_orders: 3 },
    { status_name: "Hủy đơn", total_orders: 2 },
    { status_name: "Chờ xử lý trả hàng", total_orders: 0 },
    { status_name: "Chờ nhận trả hàng", total_orders: 0 },
    { status_name: "Từ chối trả hàng", total_orders: 0 },
    { status_name: "Hoàn tiền thành công", total_orders: 0 },
    { status_name: "Hàng đang quy về shop", total_orders: 0 },
  ];

  // Cấu hình tùy chọn cho biểu đồ
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Đảm bảo chỉ hiển thị số nguyên
          callback: (value) => Math.floor(value), // Hiển thị số nguyên
        },
      },
      x: {
        title: {
          display: true,

          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${Math.floor(context.raw)} đơn`,
        },
      },
    },
  };

  return (
    <div>
      <h1 className="mb-5">
        <DatabaseOutlined style={{ marginRight: "8px" }} />
        Tổng hợp thống kê
      </h1>

      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ marginBottom: "20px" }}>
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

          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5">Khách hàng</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={topUsers.map((user, index) => ({
                key: index,
                fullname: user.fullname,
                total_quantity: user.total_quantity,
                avatar: user.avatar,
              }))}
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: "avatar",
                  key: "avatar",
                  align: "center",
                  render: (avatar) =>
                    avatar ? (
                      <img
                        src={avatar}
                        alt="user"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <Avatar icon={<UserOutlined />} size={50} />
                    ),
                },
                {
                  title: "Khách hàng",
                  dataIndex: "fullname",
                  key: "fullname",
                  align: "center",
                },
                {
                  title: "Số lượng đã mua",
                  dataIndex: "total_quantity",
                  key: "total_quantity",
                  align: "center",
                  sorter: (a, b) => a.total_quantity - b.total_quantity,
                },
              ]}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5">Top 10 sản phẩm bán chạy nhất</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={topProducts.map((item, index) => ({
                key: index,
                thumbnail: item.thumbnail,
                name: item.name,
                quantity: item.quantity,
              }))}
              columns={[
                {
                  title: "Ảnh",
                  dataIndex: "thumbnail",
                  key: "thumbnail",
                  align: "center",
                  render: (thumbnail) => (
                    <img
                      src={thumbnail || "https://via.placeholder.com/50"}
                      alt="product"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ),
                },
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

          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5">Top 10 lượt xem nhiều nhất</h1>
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
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5">Đơn hàng</h1>
            <Table
              size="small"
              pagination={false}
              bordered
              dataSource={orderStats}
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
        <Line data={expensesData} options={chartOptions} />
      </Card>
    </div>
  );
};

export default Dashboard;
