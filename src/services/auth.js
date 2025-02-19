import instance from "../axios"; // axios instance với base URL

const fetchAuth = async () => {
  const response = await instance.get("/users");
  return response.data;
};

const register = async (phone_number, password) => {
  const response = await instance.post("/client/register", {
    phone_number,
    password,
  });
  return response.data;
};

const login = async (phone_number, password) => {
  const response = await instance.post("/client/login", {
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
  const response = await instance.post(
    "/client/logout",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  localStorage.removeItem("clientToken");
  return response.data;
};

const logoutad = async () => {
  const token = localStorage.getItem("adminToken");
  const response = await instance.post(
    "/admin/logout",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  localStorage.removeItem("adminToken");
  return response.data;
};

export const AuthServices = {
  register,
  login,
  loginad,
  logout,
  logoutad,
};
