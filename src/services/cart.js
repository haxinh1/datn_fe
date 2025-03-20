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
        withCredentials: true,
      });

      console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
      return response.data.cart_items || [];
    } else {
      // Nếu chưa đăng nhập, lấy giỏ hàng từ localStorage
      const localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
      console.log("🛒 Giỏ hàng từ localStorage:", localCart);
      return localCart;
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
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.id : null;

    if (!userId) {
      // Giỏ hàng lưu trong localStorage
      let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];

      // Kiểm tra nếu sản phẩm đã có trong giỏ hàng
      const existingItemIndex = localCart.findIndex((item) => {
        return (
          item.product_id === productId &&
          (item.product_variant_id === payload.product_variant_id ||
            !payload.product_variant_id)
        );
      });

      if (existingItemIndex !== -1) {
        // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
        localCart[existingItemIndex].quantity += payload.quantity;
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm vào giỏ hàng
        localCart.push(payload);
      }

      // Cập nhật lại cart_items trong localStorage
      localStorage.setItem("cart_items", JSON.stringify(localCart));

      return { message: "Sản phẩm đã được thêm vào giỏ hàng (local)!" };
    }
    // For authenticated user
    const headers = { Authorization: `Bearer ${token}` };

    const response = await instance.post(`/cart/add/${productId}`, payload, {
      headers,
    });

    return response.data;
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
        `/cart/update/${productId}${variantId ? `/${variantId}` : ""}`,
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
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.id : null;

    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem("cart_items")) || [];
      localCart = localCart.filter(
        (item) =>
          !(
            item.product_id === productId &&
            item.product_variant_id === variantId
          )
      );
      localStorage.setItem("cart_items", JSON.stringify(localCart));
      return { message: "Sản phẩm đã được xóa khỏi giỏ hàng (local)!" };
    }

    const token = localStorage.getItem("client_token");
    const headers = { Authorization: `Bearer ${token}` };

    const response = await instance.delete(
      `/cart/remove/${productId}${variantId ? `/${variantId}` : ""}`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};

export const cartServices = {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
};
