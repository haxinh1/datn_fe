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
    localStorage.setItem("clientToken", response.data.access_token);
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
  const token = localStorage.getItem("clientToken");

  // Xóa token client trước khi gửi yêu cầu logout
  if (token) {
    const response = await instance.post(
      "/client/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // Xóa token client
    localStorage.removeItem("clientToken");
  }

  return { message: "Client logged out successfully" };
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

const getUserAddresses = async () => {
  try {
    // Lấy user_id từ localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id; // Lấy user_id từ localStorage

    if (!userId) {
      throw new Error("User ID not found in localStorage");
    }

    // Gọi API lấy địa chỉ của người dùng dựa trên user_id
    const response = await instance.get("/user-addresses", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("client_token")}`,
      },
    });

    return response.data; // Trả về dữ liệu địa chỉ
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ: ", error);
    throw error;
  }
};

export const AuthServices = {
  getUserAddresses,
  fetchAuth,
  updateUser,
  getAUser,
  register,
  verify,
  login,
  loginad,
  logoutclient,
  logoutad,
};
