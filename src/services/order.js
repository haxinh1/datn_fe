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
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  // Lấy cart từ localStorage nếu không có userId
  if (!userId) {
    const localCartItems = JSON.parse(localStorage.getItem("cart_items")) || [];
    orderData.cart_items = localCartItems;
  }

  try {
    const response = await instance.post("/orders/place", orderData, {
      headers,
    });

    // Xóa giỏ hàng trong localStorage nếu đặt hàng thành công (không đăng nhập)
    if (!userId) {
      localStorage.removeItem("cart_items");
      localStorage.removeItem("cartAttributes");
    }

    console.log("✅ Đặt hàng thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi đặt hàng:", error.response?.data || error);
    throw error;
  }
};

// danh sách đơn hàng theo người dùng
const getOrderByIdUser = async (userId) => {
  const response = await instance.get(`/orders/user/${userId}`);
  return response.data;
};

//sp đã mua theo người dùng
const productByUserId = async (userId) => {
  const response = await instance.get(`/user/${userId}/top-products`);
  return response.data;
};

// chi tiết đơn hàng theo id
const getOrderById = async (orderId) => {
  const response = await instance.get(`/orders/${orderId}/items`);
  return response.data;
};

const getDetailOrder = async (orderId) => {
  const response = await instance.get(`/orders/${orderId}`);
  return response.data;
};

// danh sách quản lý đơn hàng
const getOrderStatus = async (id) => {
  const response = await instance.get(`/orders/${id}/statuses`);
  return response.data;
};

// cập nhật trạng thái đơn hàng
// const updateOrderStatus = async (id, payload) => {
//   const clientToken = localStorage.getItem('client_token');
//   const response = await instance.put(`/orders/${id}/update-status`, payload, {
//     headers: {
//       Authorization: `Bearer ${clientToken}`,
//     },
//   });

//   return response.data;
// };

const updateOrderStatus = async (id, payload) => {
  // Lấy client_token từ localStorage
  const clientToken = localStorage.getItem("client_token");

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

// yêu cầu trả hàng
const returnOrder = async (id, payload) => {
  const respone = await instance.post(`orders/${id}/return`, payload);
  return respone.data
}

//danh sách đơn hoàn trả
const getReturnOrder = async () => {
  const response = await instance.get("/order-returns");
  return response.data;
};

// cập nhật trạng thái đơn hoàn trả
const updateOrderReturn = async (id, payload) => {
  const response = await instance.post(`/order-returns/update-status/order/${id}`, payload)
  return response.data
}

// danh sách đơn hàng theo người dùng
const getOrderReturnByIdUser = async (userId) => {
  const response = await instance.get(`/order-returns/user/${userId}`);
  return response.data;
};

const getRefund = async (id) => {
  const response = await instance.get(`/refunds/${id}`);
  return response.data;
};

// yêu cầu hoàn tiền
const requestBack = async (id, payload) => {
  const response = await instance.post(`/refunds/request/${id}`, payload)
  return response.data
}

// xác nhận hoàn tiền
const confirmBack = async (id, payload) => {
  const response = await instance.post(`/refunds/confirm/${id}`, payload)
  return response.data
}

// Xuất các hàm để dùng trong các component
export const OrderService = {
  getOrderById,
  getDetailOrder,
  placeOrder,
  getAllOrder,
  getAllBill,
  getAllStatus,
  getOrderStatus,
  updateOrderStatus,
  updateOrders,
  getOrderByIdUser,
  returnOrder,
  getReturnOrder, 
  updateOrderReturn,
  getOrderReturnByIdUser,
  getRefund, 
  requestBack,
  confirmBack,
  productByUserId
};
