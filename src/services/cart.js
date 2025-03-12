import instance from "../axios";

// Lấy giỏ hàng
// Lấy giỏ hàng
const fetchCart = async () => {
  try {
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    console.log("📌 Gửi request lấy giỏ hàng với:", {
      user_id: userId,
    });

    // Nếu người dùng đã đăng nhập, gửi request lấy giỏ hàng từ database
    if (userId) {
      const response = await instance.get("/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("client_token")}`,
        },
        params: { user_id: userId }, // Gửi user_id thay vì session_id
      });

      console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
      return response.data.cart_items || [];
    } else {
      // Nếu chưa đăng nhập, lấy giỏ hàng từ session
      const sessionCart = sessionStorage.getItem("cart");
      return sessionCart ? JSON.parse(sessionCart) : [];
    }
  } catch (error) {
    console.error("❌ Lỗi khi tải giỏ hàng:", error.response?.data || error);
    // Nếu có lỗi, trả về giỏ hàng trong session
    const sessionCart = sessionStorage.getItem("cart");
    return sessionCart ? JSON.parse(sessionCart) : [];
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

    // Xử lý thêm vào giỏ hàng dựa trên trạng thái đăng nhập
    if (userId) {
      const response = await instance.post(`cart/add/${productId}`, payload, {
        headers,
      });
      return response.data;
    } else {
      const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "[]"); // Đảm bảo là mảng rỗng nếu không có dữ liệu

      const key = productId + "-" + (payload.product_variant_id || "default");

      // Cập nhật giỏ hàng trong session
      if (sessionCart[key]) {
        sessionCart[key].quantity += payload.quantity;
      } else {
        sessionCart[key] = { ...payload };
      }

      sessionStorage.setItem("cart", JSON.stringify(sessionCart));

      return {
        message: "Sản phẩm đã được thêm vào giỏ hàng (Session)",
        cart_items: sessionCart,
      };
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
      const response = await instance.put(
        `/cart/update/${productId}${variantId ? `/${variantId}` : ""}`,
        {
          quantity: newQuantity,
        }
      );
      return response.data;
    } else {
      const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "{}");
      const key = productId + "-" + (variantId || "default");

      if (!sessionCart[key]) {
        return {
          message: "Không tìm thấy sản phẩm trong giỏ hàng",
          status: 404,
        };
      }

      // Cập nhật số lượng trong session
      sessionCart[key].quantity = newQuantity;
      sessionStorage.setItem("cart", JSON.stringify(sessionCart));

      return { message: "Cập nhật số lượng thành công (Session)" };
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
        `cart/remove/${productId}${variantId ? `/${variantId}` : ""}`,
        { headers }
      );
      return response.data;
    } else {
      // Người dùng chưa đăng nhập, xóa sản phẩm khỏi session
      const sessionCart = JSON.parse(sessionStorage.getItem("cart") || "{}");
      const key = productId + "-" + (variantId || "default");

      if (!sessionCart[key]) {
        return {
          message: "Không tìm thấy sản phẩm trong giỏ hàng",
          status: 404,
        };
      }

      delete sessionCart[key];
      sessionStorage.setItem("cart", JSON.stringify(sessionCart));

      return { message: "Sản phẩm đã được xóa khỏi giỏ hàng (Session)" };
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
