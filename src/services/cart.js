import instance from "../axios";

// Lấy giỏ hàng
const fetchCart = async () => {
  try {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    console.log("📌 Gửi request lấy giỏ hàng với:", { user_id: userId });

    if (userId) {
      // Nếu người dùng đã đăng nhập, lấy giỏ hàng từ database
      const response = await instance.get("/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("client_token")}`,
        },
        params: { user_id: userId },
        withCredentials: true, // Đảm bảo gửi cookie kèm theo request
      });

      console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
      return response.data.cart_items || [];
    } else {
      // Nếu chưa đăng nhập, lấy giỏ hàng từ session trên backend
      const response = await instance.get("/cart", {
        withCredentials: true, // Quan trọng để backend nhận diện session
      });

      console.log("🛒 Giỏ hàng từ session:", response.data.cart_items);
      return response.data.cart_items || [];
    }
  } catch (error) {
    console.error("❌ Lỗi khi tải giỏ hàng:", error.response?.data || error);
    return [];
  }
};

// Thêm sản phẩm vào giỏ hàng
const addCartItem = async (productId, payload) => {
  try {
    const token = localStorage.getItem("client_token");
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    // Kiểm tra nếu người dùng đã đăng nhập
    if (userId) {
      // Nếu đã đăng nhập, gửi yêu cầu đến backend để thêm sản phẩm vào giỏ hàng
      const response = await instance.post(`/cart/add/${productId}`, payload, {
        headers,
      });

      return response.data;
    } else {
      // Nếu chưa đăng nhập, gửi yêu cầu vào backend để lưu giỏ hàng trong session
      const response = await instance.post(`/cart/add/${productId}`, payload, {
        headers,
      });

      return response.data;
    }
  } catch (error) {
    console.error(
      "❌ Lỗi khi thêm vào giỏ hàng:",
      error.response?.data || error
    );
    throw error;
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (productId, newQuantity, variantId = null) => {
  try {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    if (userId) {
      // Nếu người dùng đã đăng nhập, gọi backend để cập nhật giỏ hàng trong cơ sở dữ liệu
      const response = await instance.put(
        `/cart/update/${productId}${variantId ? `/${variantId}` : ""}`,
        {
          quantity: newQuantity,
        }
      );
      return response.data;
    } else {
      // Nếu người dùng chưa đăng nhập, gọi backend để cập nhật giỏ hàng trong session
      const response = await instance.put(
        `/admin/cart/update/${productId}${variantId ? `/${variantId}` : ""}`,
        {
          quantity: newQuantity,
          user_id: userId, // <-- thêm user_id vào đây
        }
      );
      return response.data;
    }
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật số lượng:",
      error.response?.data || error
    );
    throw error;
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (productId, variantId = null) => {
  try {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    const token = localStorage.getItem("client_token");
    const headers = {
      Authorization: token ? `Bearer ${token}` : "",
    };

    if (userId) {
      // Người dùng đã đăng nhập, xóa sản phẩm khỏi database
      const response = await instance.delete(
        `/cart/remove/${productId}${variantId ? `/${variantId}` : ""}`,
        { headers }
      );
      return response.data;
    } else {
      // Người dùng chưa đăng nhập, xóa sản phẩm khỏi session
      const response = await instance.delete(
        `/cart/remove/${productId}${variantId ? `/${variantId}` : ""}`,
        { headers }
      );
      return response.data;
    }
  } catch (error) {
    console.error(
      "❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:",
      error.response?.data || error
    );
    throw error;
  }
};

export const cartServices = {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
