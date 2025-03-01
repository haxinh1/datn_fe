import instance from "../axios";

// Lấy giỏ hàng
const fetchCart = async () => {
  try {
    // 🔹 Lấy user_id từ localStorage nếu đã đăng nhập
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    // 🔹 Nếu chưa đăng nhập, lấy session_id từ sessionStorage
    let sessionId = sessionStorage.getItem("session_id");

    if (!userId && !sessionId) {
      // Nếu không có session_id, tạo mới và lưu vào sessionStorage
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("session_id", sessionId);
    }

    console.log("📌 Gửi request lấy giỏ hàng với:", {
      user_id: userId,
      session_id: sessionId,
    });

    // 🔹 Gửi request đến API
    const response = await instance.get("/cart", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("client_token")}`,
      },
      params: userId ? { user_id: userId } : { session_id: sessionId },
    });

    console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
    return response.data.cart_items || [];
  } catch (error) {
    console.error("❌ Lỗi khi tải giỏ hàng:", error.response?.data || error);
    return [];
  }
};

// Thêm sản phẩm vào giỏ hàng
const addCartItem = async (id, payload) => {
  try {
    const token = localStorage.getItem("client_token");

    const response = await instance.post(`cart/add/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi gửi request thêm vào giỏ hàng:",
      error.response?.data || error
    );
    throw error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (productId, newQuantity) => {
  const response = await instance.put(`cart/update/${productId}`, {
    quantity: newQuantity,
  });
  return response.data;
};
// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (productId, payload) => {
  const response = await instance.delete(`cart/remove/${productId}`, {
    data: payload,
  });
  return response.data;
};

export const cartServices = {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
