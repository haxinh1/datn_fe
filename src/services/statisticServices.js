import instance from "../axios";

//top 10 người dùng mua nhiều nhất
const fetchTopUserBought = async () => {
  try {
    const { data } = await instance.get("/statistics/top-user-bought");
    return data.topUserBought;
  } catch (error) {
    console.log(error);
  }
};

//top sản phẩm bán ra nhiều nhất
const fetchTopProductBought = async (filter = "quantity") => {
  try {
    const { data } = await instance.get("/statistics/top-product-bought", {
      params: { filter },
    });
    return data.topProductBought;
  } catch (error) {
    console.log(error);
  }
};

//doanh thu theo ngày
const fetchRevenue = async () => {
  try {
    const { data } = await instance.get("/statistics/revenue");
    return data;
  } catch (error) {
    console.log(error);
  }
};

//tổng đơn theo trạng thái
const fetchOrderStatistics = async () => {
  try {
    const { data } = await instance.get("/statistics/order-statistics");
    return data;
  } catch (error) {
    console.log(error);
  }
};

//top sản phẩm được mua và xem
const fetchTopBuyView = async () => {
  try {
    const { data } = await instance.get("/statistics/top-buy-view");
    return data;
  } catch (error) {
    console.log(error);
  }
};

//biểu đồ hoàn hủy
const fetchRevenueStatistics = async () => {
  try {
    const { data } = await instance.get("/statistics/revenue-statistics");
    return data;
  } catch (error) {
    console.log(error);
  }
};
//top doanh thu cao nhất theo ngày
const fetchTopRevenueDays = async () => {
  try {
    const { data } = await instance.get("/statistics/top-revenue-days");
    return data;
  } catch (error) {
    console.log(error);
  }
};

const fetchRevenueStock = async () => {
  try {
    const { data } = await instance.get("/statistics/revenue-stocks");
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const statisticServices = {
  fetchRevenueStock,
  fetchTopUserBought,
  fetchTopProductBought,
  fetchRevenue,
  fetchOrderStatistics,
  fetchTopBuyView,
  fetchRevenueStatistics,
  fetchTopRevenueDays,
};
