import instance from "../axios"; // axios instance với base URL

// danh sách đơn hàng
const getAllOrder = async () => {
  const response = await instance.get("/orders");
  return response.data;
};

// danh sách đơn hủy
const getAllCancel = async () => {
  const response = await instance.get("/order-cancels");
  return response.data;
};

// tìm kiếm đơn hủy
const searchOrderCancel = async (keyword = "") => {
  try {
    const response = await instance.get('/admin/orders-cancel/search', {
      params: { keyword },
    });

    // ✅ API trả về mảng đơn hàng trực tiếp
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Lỗi khi gọi API tìm kiếm đơn hàng:", error);
    return []; // fallback tránh crash
  }
};

// danh sách đơn hủy theo người dùng
const getCancelByUser = async (userId) => {
  const response = await instance.get(`/order-cancels/user/${userId}`);
  return response.data;
};

// client hủy đơn
const cancelRequest = async (payload) => {
  const response = await instance.post('/order-cancels/request-cancel', payload);
  return response.data;
};

// admin hủy đơn
const adminCancel = async (orderId, payload) => {
  const response = await instance.post(`/order-cancels/admin-cancel/${orderId}`, payload);
  return response.data;
};

// admin xác nhận hoàn tiền
const cancelBack = async (cancelId, payload) => {
  const response = await instance.post(`/order-cancels/refund/${cancelId}`, payload);
  return response.data;
};

// client gửi thông tin hoàn tiền
const infoBack = async (cancelId, payload) => {
  const response = await instance.post(`/order-cancels/submit-bank-info/${cancelId}`, payload);
  return response.data;
};

// tìm kiếm đơn hàng
const searchOrders = async (keyword = "") => {
  try {
    const response = await instance.get('/admin/orders/search', {
      params: { keyword },
    });

    // ✅ API trả về mảng đơn hàng trực tiếp
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Lỗi khi gọi API tìm kiếm đơn hàng:", error);
    return []; // fallback tránh crash
  }
};

// tìm kiếm đơn hoàn trả
const searchOrderReturn = async (keyword = "") => {
  try {
    const response = await instance.get('/admin/orders-return/search', {
      params: { keyword },
    });

    // ✅ API trả về mảng đơn hàng trực tiếp
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Lỗi khi gọi API tìm kiếm đơn hàng:", error);
    return []; // fallback tránh crash
  }
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
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.id : null;

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  try {
    // Gọi API để đặt hàng
    const response = await instance.post("/orders/place", orderData, {
      headers,
    });

    console.log("✅ Đặt hàng thành công:", response.data);

    // Nếu người dùng không đăng nhập (vãng lai), xóa sản phẩm trong localStorage
    if (!userId) {
      try {
        // Lấy giỏ hàng từ localStorage
        let localCart = JSON.parse(localStorage.getItem("cart_items") || "[]");
        let cartAttributes = JSON.parse(localStorage.getItem("cartAttributes") || "[]");

        // Lọc bỏ các sản phẩm đã mua khỏi giỏ hàng
        const purchasedItems = orderData.products.map(item => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id || null,
        }));

        // Lọc giỏ hàng để loại bỏ các sản phẩm đã mua
        localCart = localCart.filter(cartItem =>
          !purchasedItems.some(
            purchased =>
              purchased.product_id === cartItem.product_id &&
              (purchased.product_variant_id === cartItem.product_variant_id || null)
          )
        );

        // Lọc thuộc tính của sản phẩm đã mua khỏi cartAttributes
        cartAttributes = cartAttributes.filter(attr =>
          !purchasedItems.some(
            purchased =>
              purchased.product_id === attr.product_id &&
              (purchased.product_variant_id === attr.product_variant_id || null)
          )
        );

        // Cập nhật lại giỏ hàng trong localStorage
        localStorage.setItem("cart_items", JSON.stringify(localCart));
        localStorage.setItem("cartAttributes", JSON.stringify(cartAttributes));

        // Kích hoạt sự kiện để cập nhật giỏ hàng trên giao diện
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng trong localStorage:", error);
        // Không hiển thị lỗi cho người dùng vì đơn hàng đã đặt thành công
      }
    }

    return response.data; // Trả lại dữ liệu của đơn hàng
  } catch (error) {
    console.error("❌ Lỗi khi đặt hàng:", error.response?.data || error);
    throw error; // Ném lỗi để gọi lại ở nơi khác nếu cần
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

const getCodeOrder = async (orderCode) => {
  const response = await instance.get(`/orders/code/${orderCode}`);
  return response.data;
};

// danh sách quản lý đơn hàng
const getOrderStatus = async (id) => {
  const response = await instance.get(`/orders/${id}/statuses`);
  return response.data;
};

const updateOrderStatus = async (id, payload) => {
  // Lấy client_token từ localStorage
  const clientToken = localStorage.getItem("token");

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
  const respone = await instance.post(`order-returns/${id}/return`, payload);
  return respone.data;
};

//danh sách đơn hoàn trả
const getReturnOrder = async () => {
  const response = await instance.get("/order-returns");
  return response.data;
};

const confirmStock = async (id, payload) => {
  const response = await instance.post(`/order-returns/approve-return/${id}`, payload);
  return response.data;
}

// cập nhật trạng thái đơn hoàn trả
const updateOrderReturn = async (id, payload) => {
  const response = await instance.post(`/order-returns/${id}/status/update`, payload );
  return response.data;
};

// danh sách đơn hàng theo người dùng
const getOrderReturnByIdUser = async (userId) => {
  const response = await instance.get(`/order-returns/user/${userId}`);
  return response.data;
};

// chi tiết đơn hoàn trả theo id
const getReturn = async (id) => {
  const response = await instance.get(`/order-returns/${id}`);
  return response.data;
};

// yêu cầu hoàn tiền
const requestBack = async (id, payload) => {
  const response = await instance.post(`/refunds/request/${id}`, payload);
  return response.data;
};

// xác nhận hoàn tiền
const confirmBack = async (id, payload) => {
  const response = await instance.post(`/order-returns/${id}/refund/confirm`, payload);
  return response.data;
};

const retryPayment = async (orderId, paymentMethod, totalMomo) => {
  const clientToken = localStorage.getItem("token");
  try {
    const data = {
      payment_method: paymentMethod,
    };

    if (paymentMethod === "momo" && totalMomo) {
      data.total_momo = totalMomo; // Chỉ truyền total_momo khi phương thức là MoMo
    }

    const response = await instance.post(
      `/orders/${orderId}/retry-payment`,
      data, // Truyền thêm total_momo khi cần
      {
        headers: {
          Authorization: `Bearer ${clientToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thanh toán lại:", error.response?.data || error);
    throw error;
  }
};
// Xuất các hàm để dùng trong các component
export const OrderService = {
  getOrderById,
  getCodeOrder,
  searchOrders,
  searchOrderReturn,
  getDetailOrder,
  placeOrder,
  getAllOrder,
  getAllBill,
  getAllCancel,
  searchOrderCancel,
  getCancelByUser,
  cancelRequest,
  adminCancel,
  cancelBack,
  infoBack,
  getAllStatus,
  getOrderStatus,
  updateOrderStatus,
  updateOrders,
  getOrderByIdUser,
  returnOrder,
  getReturnOrder,
  confirmStock,
  updateOrderReturn,
  getOrderReturnByIdUser,
  getReturn,
  requestBack,
  confirmBack,
  retryPayment,
  productByUserId,
};
