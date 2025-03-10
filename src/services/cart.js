import instance from "../axios";

// Lấy giỏ hàng
// const fetchCart = async () => {
//   try {
//     // 🔹 Lấy user_id từ localStorage nếu đã đăng nhập
//     const user = localStorage.getItem("user");
//     const parsedUser = user ? JSON.parse(user) : null;
//     const userId = parsedUser ? parsedUser.id : null;

//     // 🔹 Nếu chưa đăng nhập, lấy session_id từ sessionStorage
//     let sessionId = sessionStorage.getItem("session_id");

//     if (!userId && !sessionId) {
//       // Nếu không có session_id, tạo mới và lưu vào sessionStorage
//       sessionId = crypto.randomUUID();
//       sessionStorage.setItem("session_id", sessionId);
//     }

//     console.log("📌 Gửi request lấy giỏ hàng với:", {
//       user_id: userId,
//       session_id: sessionId,
//     });

//     // 🔹 Gửi request đến API
//     const response = await instance.get("/cart", {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem("client_token")}`,
//       },
//       params: userId ? { user_id: userId } : { session_id: sessionId },
//     });

//     console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
//     return response.data.cart_items || [];
//   } catch (error) {
//     console.error("❌ Lỗi khi tải giỏ hàng:", error.response?.data || error);
//     return [];
//   }
// };

const fetchCart = async () => {
  try {
    // Lấy user_id từ localStorage nếu đã đăng nhập
    const user = localStorage.getItem("user");
    const parsedUser = user ? JSON.parse(user) : null;
    const userId = parsedUser ? parsedUser.id : null;

    console.log("📌 Gửi request lấy giỏ hàng với:", { user_id: userId });

    // 🔹 Gửi request đến API, không cần session_id vì backend tự quản lý
    const response = await instance.get("/cart", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("client_token")}`,
      },
      params: userId ? { user_id: userId } : {}, // Không cần gửi session_id
    });

    console.log("✅ Dữ liệu giỏ hàng từ API:", response.data);
    return response.data.cart_items || [];
  } catch (error) {
    console.error("❌ Lỗi khi tải giỏ hàng:", error.response?.data || error);
    return [];
  }
};

// Thêm sản phẩm vào giỏ hàng
// const addCartItem = async (id, payload) => {
//   try {
//     const token = localStorage.getItem("client_token");

//     const response = await instance.post(`cart/add/${id}`, payload, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error(
//       "Lỗi khi gửi request thêm vào giỏ hàng:",
//       error.response?.data || error
//     );
//     throw error;
//   }
// };

// const addCartItem = async (id, payload) => {
//   try {
//     const token = localStorage.getItem("client_token");

//     const response = await instance.post(`cart/add/${id}`, payload, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Lỗi khi thêm vào giỏ hàng:",
//       error.response?.data || error
//     );
//     throw error;
//   }
// };

const addCartItem = async (id, payload) => {
  try {
    const token = localStorage.getItem("client_token");

    // Tạo header cho request, bao gồm authorization nếu token tồn tại
    const headers = {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };

    // Gửi request để thêm sản phẩm vào giỏ hàng
    const response = await instance.post(`cart/add/${id}`, payload, {
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
  // Gửi yêu cầu PUT với URL và dữ liệu trực tiếp
  const response = await instance.put(
    `/cart/update/${productId}${variantId ? `/${variantId}` : ""}`,
    {
      quantity: newQuantity,
    }
  );
  return response.data;
};
// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (productId, variantId = null) => {
  try {
    const token = localStorage.getItem("client_token");

    // Xây dựng URL dựa trên việc có variantId hay không
    const url = variantId
      ? `cart/remove/${productId}/${variantId}`
      : `cart/remove/${productId}`;

    const response = await instance.delete(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    console.log("✅ Sản phẩm đã được xóa khỏi giỏ hàng:", response.data);
    return response.data;
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
