import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Card, Table, Row, Col, Avatar, DatePicker, Skeleton, Image } from "antd";
import { UserOutlined, DatabaseOutlined, CalendarOutlined } from "@ant-design/icons";
import { statisticServices } from "../services/statisticServices";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import moment from "moment";

// Đăng ký các thành phần của ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { MonthPicker, YearPicker } = DatePicker;

const Dashboard = () => {
  // Khởi tạo state cho dữ liệu biểu đồ
  const [expensesData, setExpensesData] = useState({
    datasets: [],
    labels: [],
  });
  // State cho các danh sách dữ liệu
  const [topUsers, setTopUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatistics, setOrderStatistics] = useState([]);
  const [revenueStatistics, setRevenueStatistics] = useState({});
  const [topRevenueDays, setTopRevenueDays] = useState([]);
  const [topView, setTopView] = useState([]);
  const [topBuy, setTopBuy] = useState([]);
  const [revenueByDay, setRevenueByDay] = useState([]);
  // State cho nhập hàng theo ngày
  const [stockByDay, setStockByDay] = useState([]);
  const [filteredStockDay, setFilteredStockDay] = useState(0);
  // State cho bộ lọc ngày, tháng, năm (mặc định là hiện tại)
  const [selectedDate, setSelectedDate] = useState(moment()); // Ngày hiện tại
  const [selectedMonth, setSelectedMonth] = useState(moment()); // Tháng hiện tại
  const [selectedYear, setSelectedYear] = useState(moment()); // Năm hiện tại
  // State cho doanh thu theo ngày, tháng, năm
  const [filteredRevenueDay, setFilteredRevenueDay] = useState(0);
  const [filteredRevenueMonth, setFilteredRevenueMonth] = useState(0);
  const [filteredRevenueYear, setFilteredRevenueYear] = useState(0);
  // State cho trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Hàm lấy dữ liệu thống kê doanh thu và cập nhật biểu đồ
  useEffect(() => {
    const fetchRevenueStatistics = async () => {
      const data = await statisticServices.fetchRevenueStatistics();
      const labels = data.statistics.map((item) => item.date);
      const cancelledOrders = data.statistics.map((item) => {
        const value = Number(item.cancelled_orders);
        return isNaN(value) ? 0 : Math.floor(value);
      });
      const returnedOrders = data.statistics.map((item) => {
        const value = Number(item.returned_orders);
        return isNaN(value) ? 0 : Math.floor(value);
      });

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

    // Hàm lấy toàn bộ dữ liệu từ API
    const fetchAll = async () => {
      await fetchRevenueStatistics();
      const [topU, topP, orderS, topR, buyView, revDay, stockDay] = await Promise.all([
        statisticServices.fetchTopUserBought(),
        statisticServices.fetchTopProductBought(),
        statisticServices.fetchOrderStatistics(),
        statisticServices.fetchTopRevenueDays(),
        statisticServices.fetchTopBuyView(),
        statisticServices.fetchRevenue(),
        statisticServices.fetchRevenueStock(),
      ]);
      setTopUsers(topU.datas || []);
      setTopProducts(topP.datas || []);
      setOrderStatistics(orderS.orderStats || []);
      setTopRevenueDays(topR.topDays || []);
      setTopBuy(buyView.dataBuy || []);
      setTopView(buyView.dataView || []);
      setRevenueByDay(revDay.revenue || []);
      setStockByDay(stockDay.revenueStock?.datas || []); // Lấy từ revenueStock.datas
      // Tính toán doanh thu và nhập hàng
      updateRevenueDay(revDay.revenue, moment());
      updateRevenueMonth(revDay.revenue, moment());
      updateRevenueYear(revDay.revenue, moment());
      updateStockDay(stockDay.revenueStock?.datas || [], moment());
      setLoading(false);
    };

    fetchAll();
  }, []);

  // Hàm tính doanh thu theo ngày
  const updateRevenueDay = (revenueData, date) => {
    if (!date || !revenueData) return;
    const formattedDate = date.format("YYYY-MM-DD");
    const dayRevenue = revenueData
      .filter((item) => {
        const itemDate = new Date(item.date);
        const formattedItemDate = itemDate.toISOString().split("T")[0];
        return formattedItemDate === formattedDate;
      })
      .reduce((sum, item) => sum + Number(item.revenue), 0);
    setFilteredRevenueDay(dayRevenue);
  };

  // Hàm tính doanh thu theo tháng
  const updateRevenueMonth = (revenueData, month) => {
    if (!month || !revenueData) return;
    const currentMonth = month.month() + 1;
    const currentYearForMonth = month.year();
    const monthRevenue = revenueData
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() + 1 === currentMonth &&
          itemDate.getFullYear() === currentYearForMonth
        );
      })
      .reduce((sum, item) => sum + Number(item.revenue), 0);
    setFilteredRevenueMonth(monthRevenue);
  };

  // Hàm tính doanh thu theo năm
  const updateRevenueYear = (revenueData, year) => {
    if (!year || !revenueData) return;
    const currentYear = year.year();
    const yearRevenue = revenueData
      .filter((item) => new Date(item.date).getFullYear() === currentYear)
      .reduce((sum, item) => sum + Number(item.revenue), 0);
    setFilteredRevenueYear(yearRevenue);
  };

  // Hàm tính nhập hàng theo ngày
  const updateStockDay = (stockData, date) => {
    if (!date || !stockData) return;
    const formattedDate = date.format("YYYY-MM-DD");
    const dayStock = stockData
      .filter((item) => {
        const itemDate = new Date(item.date);
        const formattedItemDate = itemDate.toISOString().split("T")[0];
        return formattedItemDate === formattedDate;
      })
      .reduce((sum, item) => sum + Number(item.total_amount), 0); // Sử dụng total_amount
    setFilteredStockDay(dayStock);
  };

  // Xử lý khi thay đổi ngày
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      updateRevenueDay(revenueByDay, date);
      updateStockDay(stockByDay, date); // Cập nhật nhập hàng theo ngày
    }
  };

  // Xử lý khi thay đổi tháng
  const handleMonthChange = (month) => {
    if (month) {
      setSelectedMonth(month);
      updateRevenueMonth(revenueByDay, month);
    }
  };

  // Xử lý khi thay đổi năm
  const handleYearChange = (year) => {
    if (year) {
      setSelectedYear(year);
      updateRevenueYear(revenueByDay, year);
    }
  };

  // Hàm định dạng ngày
  const formatDate = (str) => new Date(str).toLocaleDateString("en-GB");

  // Hàm định dạng giá tiền
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  // Cấu hình biểu đồ
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Math.floor(value),
          stepSize: 1,
        },
        suggestedMax: 5,
        max: (context) => {
          const chart = context.chart;
          const datasets = chart.data.datasets;
          const maxDataValue = Math.max(
            ...datasets.flatMap((dataset) => dataset.data)
          );
          return Math.max(Math.ceil(maxDataValue) + 1, 5);
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
      <style>
        {`
          .custom-date-picker .ant-picker-input input {
            visibility: hidden !important;
            width: 0 !important;
          }
          .custom-date-picker .ant-picker-suffix {
            margin: 0 !important;
          }
          .custom-date-picker .ant-picker-input {
            width: 24px !important;
          }
          .ant-table-thead > tr > th {
            background-color: #f0f2f5 !important;
            font-weight: bold;
          }
          .ant-table-tbody > tr > td {
            text-align: center !important;
          }
          .combined-column {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .revenue-card {
            border-left: 4px solid #1890ff !important;
            border-top: 1px solid #000 !important;
            border-right: 1px solid #000 !important;
            border-bottom: 1px solid #000 !important;
          }
        `}
      </style>

      <h1 className="mb-5">
        <DatabaseOutlined style={{ marginRight: "8px" }} />
        Tổng hợp thống kê
      </h1>

      {/* Phần doanh thu */}
      <Row gutter={24} style={{ marginBottom: "20px" }}>
        <Col span={24}>
          <Card>
            <h1 className="mb-5">Doanh thu</h1>
            <Row gutter={24}>
              {/* Nhập hàng theo ngày */}
              <Col span={6}>
                <Card bordered={false} className="revenue-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4>Nhập hàng ngày</h4>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="custom-date-picker"
                      suffixIcon={<CalendarOutlined style={{ fontSize: '24px' }} />}
                      placeholder=""
                      bordered={false}
                    />
                  </div>
                  <span className="w-warning">
                    {filteredStockDay > 0
                      ? `${formatPrice(filteredStockDay)} VNĐ`
                      : "Chưa có dữ liệu"}
                  </span>
                </Card>
              </Col>
              {/* Doanh thu theo ngày */}
              <Col span={6}>
                <Card bordered={false} className="revenue-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4>Doanh thu ngày</h4>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="custom-date-picker"
                      suffixIcon={<CalendarOutlined style={{ fontSize: '24px' }} />}
                      placeholder=""
                      bordered={false}
                    />
                  </div>
                  <span className="w-warning">
                    {filteredRevenueDay > 0
                      ? `${formatPrice(filteredRevenueDay)} VNĐ`
                      : "Chưa có dữ liệu"}
                  </span>
                </Card>
              </Col>

              {/* Doanh thu theo tháng */}
              <Col span={6}>
                <Card bordered={false} className="revenue-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4>Doanh thu tháng</h4>
                    <MonthPicker
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="custom-date-picker"
                      suffixIcon={<CalendarOutlined style={{ fontSize: '24px' }} />}
                      placeholder=""
                      bordered={false}
                      format="MM/YYYY"
                    />
                  </div>
                  <span className="w-warning">
                    {filteredRevenueMonth > 0
                      ? `${formatPrice(filteredRevenueMonth)} VNĐ`
                      : "Chưa có dữ liệu"}
                  </span>
                </Card>
              </Col>
              {/* Doanh thu theo năm */}
              <Col span={6}>
                <Card bordered={false} className="revenue-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <h4>Doanh thu năm</h4>
                    <YearPicker
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="custom-date-picker"
                      suffixIcon={<CalendarOutlined style={{ fontSize: '24px' }} />}
                      placeholder=""
                      bordered={false}
                      format="YYYY"
                    />
                  </div>
                  <span className="w-warning">
                    {filteredRevenueYear > 0
                      ? `${formatPrice(filteredRevenueYear)} VNĐ`
                      : "Chưa có dữ liệu"}
                  </span>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Phần khách hàng, sản phẩm, đơn hàng */}
      <Row gutter={24}>
        {/* Bảng khách hàng */}
        <Col span={8}>
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5 text-blue-600">Khách hàng</h1>

            <Skeleton loading={loading} active>
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
                    title: "Khách hàng",
                    key: "fullname",
                    align: "center",
                    render: (record) => (
                      <div className="combined-column">
                        <Avatar src={record.avatar} size="large" />
                        <span>{record.fullname}</span>
                      </div>
                    ),
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
            </Skeleton>
          </Card>
        </Col>

        {/* Bảng sản phẩm */}
        <Col span={8}>
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5 text-blue-600">
              Top 10 sản phẩm bán chạy nhất
            </h1>

            <Skeleton loading={loading} active>
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
                    title: "Sản phẩm",
                    key: "name",
                    align: "center",
                    render: (record) => (
                      <div className="combined-column">
                        <Image src={record.thumbnail} width={60} />
                        <span>{record.name}</span>
                      </div>
                    ),
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
            </Skeleton>
          </Card>

          {/* Bảng lượt xem */}
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5 text-blue-600">Top 10 lượt xem nhiều nhất</h1>

            <Skeleton loading={loading} active>
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
                    render: (_, record) => (
                      <div className="combined-column">
                        <Image src={record.thumbnail} width={60} />
                        <span>{record.name}</span>
                      </div>
                    ),
                  },
                  {
                    title: "Lượt xem",
                    dataIndex: "views",
                    align: "center",
                    sorter: (a, b) => a.views - b.views,
                  },
                ]}
              />
            </Skeleton>
          </Card>
        </Col>

        {/* Bảng đơn hàng */}
        <Col span={8}>
          <Card style={{ marginBottom: "20px" }}>
            <h1 className="mb-5 text-blue-600">Đơn hàng</h1>

            <Skeleton loading={loading} active>
              <Table
                size="small"
                pagination={false}
                bordered
                dataSource={orderStatistics}
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
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ hoàn hủy */}
      <Card>
        <h1 className="mb-5">Biểu đồ hoàn hủy</h1>
        <Line data={expensesData} options={chartOptions} />
      </Card>
    </div>
  );
};

export default Dashboard;