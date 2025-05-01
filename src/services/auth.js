import instance from "../axios"; 

const fetchAuth = async () => {
  try {
    const response = await instance.get("/admin/users"); 
    return response?.data ? response : { data: [] }; 
  } catch (error) {
    console.error("Lỗi gọi API:", error);
    return { data: [] }; 
  }
};

const getAllCustomer = async (payload) => {
  const response = await instance.get(`/admin/users/customer`, payload);
  return response.data;
};


const searchUsers = async (keyword = "") => {
  try {
    const response = await instance.get("/admin/users/search", {
      params: { keyword },
    });
    return response.data || []; 
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    return [];
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

const getPointByUser = async (id) => {
  const response = await instance.get(`/user/points/${id}`);
  return response.data;
};

const bannedHistory = async (id) => {
  const response = await instance.get(`/banned-history/${id}`);
  return response.data;
};


const getModifiedById = async (id) => {
  const response = await instance.get(`/orders/modified-by/${id}`);
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


const update = async (id, userData) => {
  const response = await instance.put(`/admin/users/${id}`, userData);
  return response.data;
};


const changePassword = async (id, userData) => {
  const token =
    localStorage.getItem("client_token") || localStorage.getItem("adminToken"); 

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  try {
    const response = await instance.put(
      `/admin/change-password/${id}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


const forget = async (userData) => {
  const response = await instance.post("/forgot-password", userData);
  return response.data;
};


const reset = async (userData) => {
  const response = await instance.post("/reset-password", userData);
  return response.data;
};

const verify = async (payload) => {
  const response = await instance.post("/verify-email", payload);
  return response.data;
};

const resend = async (payload) => {
  const response = await instance.post("/resend-code", payload);
  return response.data;
}

const login = async (phone_number, password) => {
  const response = await instance.post("/login", {
    phone_number,
    password,
  });

  if (response.data.access_token) {
    
    localStorage.setItem("client_token", response.data.access_token);
    localStorage.setItem("client", JSON.stringify(response.data.user)); 
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
  const token = localStorage.getItem("client_token");

  if (!token) {
    return;
  }

  try {
    // Call the logout API
    await instance.post(
      "/client/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Clear authentication data from localStorage
    localStorage.removeItem("client_token");
    localStorage.removeItem("client");

    // Redirect to the login page and refresh the page
    window.location.href = "/logincl";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const logoutad = async () => {
  const token = localStorage.getItem("adminToken");

  
  if (token) {
    const response = await instance.post(
      "/admin/logout",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    localStorage.removeItem("adminToken");
  }

  return { message: "Admin logged out and adminToken cleared" };
};

const getAddressByIdUser = async (userId) => {
  const token =
    localStorage.getItem("client_token") || localStorage.getItem("admin_token");

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  const response = await instance.get(`user-addresses/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};


const addAddress = async (payload) => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  const response = await instance.post("/user-addresses", payload, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};

const getaAddress = async (id) => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  const response = await instance.get(`/useraddress-addresses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};


const updateAddress = async (id, payload) => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  const response = await instance.put(`/user-addresses/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};

const deleteAddress = async (id) => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    throw new Error("Token xác thực không có trong localStorage");
  }

  const response = await instance.delete(`/user-addresses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};


const loginGoogle = async () => {
  const response = await instance.get("/auth/google");
  return response.data;
};

export const AuthServices = {
  fetchAuth,
  getAllCustomer,
  searchUsers,
  updateUser,
  getAUser,
  getPointByUser,
  register,
  verify,
  getModifiedById,
  bannedHistory,
  login,
  forget,
  resend,
  update,
  reset,
  changePassword,
  loginad,
  logoutclient,
  logoutad,
  getAddressByIdUser,
  addAddress,
  getaAddress,
  updateAddress,
  deleteAddress,
  loginGoogle,
};
