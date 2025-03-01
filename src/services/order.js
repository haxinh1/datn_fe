import instance from "../axios";

const getOrders = async () => {
  const response = await instance.get("/orders");
  return response.data;
};

const getOrdersByUserId = async (userId) => {
  const response = await instance.get(`/orders/user/${userId}`);
  return response.data;
};

const placeOrder = async (orderData) => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await instance.post("/orders/place", orderData, { headers });
  return response.data;
};

const getOrderById = async (orderId) => {
  const response = await instance.get(`/orders/${orderId}`);
  return response.data;
};

const updateOrderStatus = async (orderId, statusData) => {
  const response = await instance.post(
    `/orders/${orderId}/update-status`,
    statusData
  );
  return response.data;
};

export const orderServices = {
  getOrders,
  placeOrder,
  getOrderById,
  updateOrderStatus,
  getOrdersByUserId,
};
