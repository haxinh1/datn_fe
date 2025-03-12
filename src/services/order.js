import instance from "../axios"; // axios instance với base URL

// danh sách đơn hàng
const getAllOrder = async () => {
  const response = await instance.get("/orders");
  return response.data;
};

// danh sách trạng thái
const getAllStatus = async () => {
  const response = await instance.get("/order-statuses");
  return response.data;
};

const placeOrder = async (orderData) => {
  const token = localStorage.getItem("client_token");

  // Kiểm tra xem có token không
  const headers = {
    "Content-Type": "application/json",
  };

  // Nếu có token, thêm header Authorization
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await instance.post("/orders/place", orderData, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt hàng:", error.response?.data || error);
    throw error;
  }
};

const getOrderById = async (orderId) => {
  const response = await instance.get(`/orders/${orderId}`);
  return response.data;
};

// danh sách quản lý đơn hàng
const getOrderStatus = async (id) => {
  const response = await instance.get(`/orders/${id}/statuses`);
  return response.data;
};

// cập nhật trạng thái đơn hàng
const updateOrderStatus = async (id, payload) => {
  const response = await instance.put(`/orders/${id}/update-status`, payload);
  return response.data;
};

// Xuất các hàm để dùng trong các component
export const OrderService = {
  getOrderById,
  placeOrder,
  getAllOrder,
  getAllStatus,
  getOrderStatus,
  updateOrderStatus,
};
