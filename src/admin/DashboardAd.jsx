import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { statisticServices } from "../services/statisticServices"; // Giả sử dịch vụ được import từ đây

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

// Đăng ký các thành phần của chart.js
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
  // Các state để lưu trữ dữ liệu khi lấy từ API
  const [expensesData, setExpensesData] = useState({
    datasets: [],
    labels: [],
  });
  const [topUsers, setTopUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatistics, setOrderStatistics] = useState([]);
  const [revenueStatistics, setRevenueStatistics] = useState({});
  const [topRevenueDays, setTopRevenueDays] = useState([]);
  const [topView, setTopView] = useState([]); // Top sản phẩm mua và xem nhiều nhất
  const [topBuy, setTopBuy] = useState([]); // Top sản phẩm mua và xem nhiều nhất
  const [revenueByDay, setRevenueByDay] = useState([]); // Doanh thu theo ngày
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); // Tìm kiếm người dùng

  // Hàm gọi API khi component mount (khi trang được tải lần đầu)
  useEffect(() => {
    // Hàm gọi API cho doanh thu theo ngày
    const fetchRevenueStatistics = async () => {
      try {
        const data = await statisticServices.fetchRevenueStatistics();
        console.log("Dữ liệu biểu đồ hoàn hủy:", data); // Log data for debugging

        // Trích xuất các ngày từ data.statistics
        const labels = data.statistics.map((item) => item.date);
        // Chuyển đổi các giá trị thành số
        const cancelledOrders = data.statistics.map(
          (item) => Number(item.cancelled_orders) || 0
        ); // Chuyển chuỗi thành số
        const returnedOrders = data.statistics.map(
          (item) => Number(item.returned_orders) || 0
        ); // Chuyển chuỗi thành số

        setExpensesData({
          labels: labels, // Chỉ lấy ngày làm labels
          datasets: [
            {
              label: "Hoàn",
              data: returnedOrders, // Dữ liệu cho Hoàn
              borderColor: "green",
              backgroundColor: "rgba(8, 164, 187, 0.1)",
              fill: true,
            },
            {
              label: "Hủy",
              data: cancelledOrders, // Dữ liệu cho Hủy
              borderColor: "blue",
              backgroundColor: "rgba(169, 169, 169, 0.1)",
              fill: true,
            },
          ],
          options: {
            responsive: true,
            scales: {
              x: {
                type: "category", // Trục x sẽ là các giá trị kiểu danh mục (ngày tháng)
                position: "bottom", // Đảm bảo trục x ở phía dưới
                reverse: false, // Thứ tự sẽ đi từ trái sang phải
              },
              y: {
                beginAtZero: true, // Bắt đầu từ 0 cho trục y
                position: "right", // Đặt trục y ở bên phải
                reverse: false, // Không đảo ngược trục y, giữ trục y đúng cách
              },
            },
          },
        });

        setRevenueStatistics(data); // Lưu dữ liệu doanh thu
      } catch (error) {
        console.error("Error fetching revenue statistics:", error);
      }
    };

    // Hàm gọi API cho top người dùng mua nhiều nhất
    const fetchTopUsers = async () => {
      try {
        const data = await statisticServices.fetchTopUserBought();
        console.log("Top người dùng:", data); // Log data for debugging
        setTopUsers(data.datas || []); // Giả sử data là danh sách người dùng
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    };

    // Hàm gọi API cho top sản phẩm bán chạy
    const fetchTopProducts = async () => {
      try {
        const data = await statisticServices.fetchTopProductBought();
        console.log("Top sản phẩm:", data); // Log data for debugging
        setTopProducts(data.datas || []); // Giả sử data là danh sách sản phẩm
      } catch (error) {
        console.error("Error fetching top products:", error);
      }
    };

    // Hàm gọi API cho thống kê trạng thái đơn hàng
    const fetchOrderStatistics = async () => {
      try {
        const data = await statisticServices.fetchOrderStatistics();
        console.log("Tổng đơn:", data); // Log data for debugging
        setOrderStatistics(data.orderStats || []); // Giả sử data là thống kê trạng thái đơn hàng
      } catch (error) {
        console.error("Error fetching order statistics:", error);
      }
    };

    // Hàm gọi API cho top doanh thu theo ngày
    const fetchTopRevenueDays = async () => {
      try {
        const data = await statisticServices.fetchTopRevenueDays();
        console.log("Top doanh thu theo ngày:", data); // Log data for debugging
        setTopRevenueDays(data.topDays || []); // Giả sử data là top doanh thu theo ngày
      } catch (error) {
        console.error("Error fetching top revenue days:", error);
      }
    };

    // Hàm gọi API cho top sản phẩm mua và xem nhiều nhất
    const fetchTopBuyView = async () => {
      try {
        const data = await statisticServices.fetchTopBuyView();
        console.log("Top sản phẩm mua và xem nhiều nhất:", data); // Log data for debugging

        // Lưu cả dataBuy và dataView vào state
        setTopBuy(data.dataBuy || []); // Giả sử dataBuy chứa top sản phẩm mua
        setTopView(data.dataView || []); // Giả sử dataView chứa top sản phẩm xem nhiều
      } catch (error) {
        console.error("Error fetching top buy view:", error);
      }
    };

    // Hàm gọi API cho doanh thu theo ngày
    const fetchRevenueByDay = async () => {
      try {
        const data = await statisticServices.fetchRevenue();
        console.log("Doanh thu theo ngày:", data); // Log data for debugging
        setRevenueByDay(data.revenue || []); // Lưu doanh thu theo ngày
      } catch (error) {
        console.error("Error fetching revenue by day:", error);
      }
    };

    // Gọi tất cả các hàm fetch dữ liệu
    const fetchData = async () => {
      await fetchRevenueStatistics();
      await fetchTopUsers();
      await fetchTopProducts();
      await fetchOrderStatistics();
      await fetchTopRevenueDays();
      await fetchTopBuyView();
      await fetchRevenueByDay();
      setLoading(false);
    };

    fetchData(); // Gọi hàm fetch dữ liệu
  }, []); // Mảng phụ thuộc rỗng đảm bảo hàm chỉ chạy một lần khi component mount

  const handleSearch = (event) => {
    setSearch(event.target.value); // Cập nhật giá trị tìm kiếm người dùng
  };

  if (loading) {
    return <div>Loading...</div>; // Hiển thị khi dữ liệu đang được tải
  }

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Card for Total Users and Sessions */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "30px",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "350px",
          }}
        >
          <div
            style={{
              border: "1px solid #007bff",
              marginBottom: "10px",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "18px",
              background: "#ffffff",
            }}
          >
            <h2 style={{ fontSize: "24px" }}>Doanh thu</h2>
            {/* Phần cuộn với max-height */}
            <div
              style={{
                maxHeight: "120px", // Giới hạn chiều cao
                overflowY: "auto", // Tạo thanh cuộn dọc khi nội dung dài hơn
                height: "120px", // Đảm bảo chiều cao cố định
              }}
            >
              <ul>
                {revenueByDay.length ? (
                  revenueByDay
                    .slice(0, 3) // Hiển thị 3 mục đầu tiên
                    .map((data, index) => {
                      // Chuyển đổi date thành chỉ có ngày, tháng, năm
                      const date = new Date(data.date); // Chuyển chuỗi thành đối tượng Date
                      const formattedDate = date.toLocaleDateString("en-GB"); // Định dạng dd/mm/yyyy
                      return (
                        <li key={index}>
                          {formattedDate} + {data.revenue} VNĐ
                        </li>
                      );
                    })
                ) : (
                  <li>No data available</li>
                )}
              </ul>
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "18px",
            }}
          >
            <h2 style={{ fontSize: "24px" }}>Top doanh thu</h2>
            <ul>
              {topRevenueDays.length ? (
                topRevenueDays.map((data, index) => {
                  const date = new Date(data.date);
                  const formattedDate = date.toLocaleDateString("en-GB"); // Định dạng dd/mm/yyyy
                  return (
                    <li key={index}>
                      {formattedDate} {""}
                      {data.total_revenue} VNĐ
                    </li>
                  );
                })
              ) : (
                <li>No data available</li>
              )}
            </ul>
          </div>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "22px" }}>
            Top 10 sản phẩm bán ra nhiều nhất
          </h3>
          <ul>
            {topProducts.map((product, index) => (
              <li key={index}>
                {product.name} - {product.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "22px" }}>Tổng trạng thái theo đơn</h3>
          <ul>
            {orderStatistics.length ? (
              orderStatistics.map((status, index) => (
                <li key={index}>
                  {status.status_name}: {status.total_orders} orders
                </li>
              ))
            ) : (
              <li>No data available</li>
            )}
          </ul>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "60%",
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "22px" }}>Biểu đồ hoàn hủy</h3>
          <Line data={expensesData} />
        </div>

        <div
          style={{
            width: "35%",
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ fontSize: "22px" }}>Top 10 người dùng tiêu biểu</h3>
          <ul>
            {topUsers.length ? (
              topUsers.map((data, index) => (
                <li key={index}>
                  {data.avatar} {data.fullname} {data.total_quantity}
                </li>
              ))
            ) : (
              <li>No data available</li>
            )}
          </ul>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        {/* <h3>Users</h3>
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={handleSearch}
          style={{ padding: "8px", fontSize: "14px" }}
        /> */}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <table style={{ width: "48%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Tên sản phẩm
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Lượt mua</th>
            </tr>
          </thead>
          <tbody>
            {topBuy.length ? (
              topBuy.map((buyItem, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>{buyItem.name}</td>
                  <td style={{ padding: "10px" }}>{buyItem.total_sold}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No data available for purchases
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table style={{ width: "48%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Tên sản phẩm
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Lượt xem</th>
            </tr>
          </thead>
          <tbody>
            {topView.length ? (
              topView.map((viewItem, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: "10px" }}>{viewItem.name}</td>

                  {/* No purchase data in topView */}
                  <td style={{ padding: "10px" }}>{viewItem.views}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "10px" }}
                >
                  No data available for views
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
