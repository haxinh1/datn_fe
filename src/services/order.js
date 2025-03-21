import instance from "../axios"; // axios instance với base URL

// danh sách đơn hàng
const getAllOrder = async () => {
  const response = await instance.get("/orders");
  return response.data;
};

// danh sách hoá đơn
const getAllBill = async () => {
  const response = await instance.get("/completed");
  return response.data;
};

// danh sách trạng thái
const getAllStatus = async () => {
  const response = await instance.get("/order-statuses");
  return response.data;
};

const placeOrder = async (orderData) => {
  const token = localStorage.getItem("client_token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : null;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  orderData.user_id = userId || null;

  try {
    const response = await instance.post("/orders/place", orderData, {
      headers,
    });
    console.log("Response backend (order):", response.data); // Thêm dòng này
    return response.data;
  } catch (error) {
    console.error("Lỗi khi đặt hàng:", error.response?.data || error);
    throw error;
  }
};

// danh sách đơn hàng theo người dùng
const getOrderByIdUser = async (userId) => {
  const response = await instance.get(`/orders/user/${userId}`);
  return response.data;
};

// chi tiết đơn hàng theo id
const getOrderById = async (orderId) => {
  const response = await instance.get(`/orders/${orderId}/items`);
  return response.data;
};

// danh sách quản lý đơn hàng
const getOrderStatus = async (id) => {
  const response = await instance.get(`/orders/${id}/statuses`);
  return response.data;
};

// cập nhật trạng thái đơn hàng
const updateOrderStatus = async (id, payload) => {
  // Lấy client_token từ localStorage
  const clientToken = localStorage.getItem('client_token');

  // Gửi client_token trong headers khi gọi API
  const response = await instance.put(`/orders/${id}/update-status`, payload, {
    headers: {
      Authorization: `Bearer ${clientToken}`, // Hoặc truyền trực tiếp client_token vào nếu cần
    },
  });

  return response.data;
};

// cập nhật trạng thái nhiều đơn hàng đơn hàng
const updateOrders = async (payload) => {
  const response = await instance.put(`orders/batch-update-status`, payload);
  return response.data;
};

// Xuất các hàm để dùng trong các component
export const OrderService = {
  getOrderById,
  placeOrder,
  getAllOrder,
  getAllBill,
  getAllStatus,
  getOrderStatus,
  updateOrderStatus,
  updateOrders,
  getOrderByIdUser,
};
