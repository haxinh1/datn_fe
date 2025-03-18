import instance from "../axios"; // axios instance với base URL

const fetchAuth = async () => {
  try {
    const response = await instance.get("/admin/users"); // Kiểm tra API URL có đúng không
    return response?.data ? response : { data: [] }; // Trả về mảng rỗng nếu không có dữ liệu
  } catch (error) {
    console.error("Lỗi gọi API:", error);
    return { data: [] }; // Tránh lỗi khi API bị lỗi
  }
};

const getAUser = async (id) => {
  const response = await instance.get(`/admin/users/${id}`);
  return response.data;
};

const updateUser = async (id, payload) => {
  const response = await instance.put(`/admin/users/${id}`, payload);
  return response.data;
};

const register = async (userData) => {
  try {
    const response = await instance.post("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi đăng ký:", error.response?.data);
    throw new Error(error.response?.data?.message || "Đăng ký thất bại");
  }
};

// cập nhật tài khoản
const update = async (id, userData) => {
  const response = await instance.put(`/admin/users/${id}`, userData);
  return response.data;
};

// đổi mật khẩu
const changePassword = async (id, userData) => {
  const response = await instance.put(`/admin/change-password/${id}`, userData);
  return response.data;
};

// quên mật khẩu client
const forget = async (userData) => {
  const response = await instance.post("/forgot-password", userData);
  return response.data;
};

// đặt lại mật khẩu
const reset = async (userData) => {
  const response = await instance.post("/reset-password", userData);
  return response.data;
};

const verify = async (payload) => {
  const response = await instance.post("/verify-email", payload);
  return response.data;
};

const login = async (phone_number, password) => {
  const response = await instance.post("/login", {
    phone_number,
    password,
  });

  if (response.data.access_token) {
    // Lưu token và user vào localStorage
    localStorage.setItem("client_token", response.data.access_token);
    localStorage.setItem("client", JSON.stringify(response.data.user)); // Lưu thông tin user
  }

  return response.data;
};

const loginad = async (phone_number, password) => {
  const response = await instance.post("/admin/login", {
    phone_number,
    password,
  });

  if (response.data.access_token) {
    localStorage.setItem("adminToken", response.data.access_token);
  }

  return response.data;
};

const logoutclient = async () => {
  const token = localStorage.getItem("client_token"); // Đảm bảo lấy đúng key

  // Xóa token client trước khi gửi yêu cầu logout
  if (token) {
    try {
      // Gửi yêu cầu logout với Authorization header
      const response = await instance.post(
        "/client/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Nếu cần, bạn có thể xử lý response tại đây, ví dụ: kiểm tra xem logout thành công hay chưa

      // Sau khi logout thành công, xóa cả client_token và user khỏi localStorage
      localStorage.removeItem("client_token"); // Xóa token client
      localStorage.removeItem("client"); // Xóa thông tin user

      return { message: "Client logged out successfully" };
    } catch (error) {
      console.error("Logout failed", error);
      return { message: "Logout failed. Please try again!" };
    }
  }

  // Nếu không tìm thấy client_token, có thể người dùng đã không đăng nhập
  return { message: "No client token found" };
};

const logoutad = async () => {
  const token = localStorage.getItem("adminToken");

  // Xóa token admin trước khi gửi yêu cầu logout
  if (token) {
    const response = await instance.post(
      "/admin/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // Xóa token admin
    localStorage.removeItem("adminToken");
  }

  return { message: "Admin logged out and adminToken cleared" };
};

const getAddressByIdUser = async (userId) => {
  const response = await instance.get(`user-addresses/${userId}`);
  return response.data;
};

export const AuthServices = {
  fetchAuth,
  updateUser,
  getAUser,
  register,
  verify,
  login,
  forget,
  update,
  reset,
  changePassword,
  loginad,
  logoutclient,
  logoutad,
  getAddressByIdUser,
};
