import instance from "../axios"; // axios instance với base URL

const fetchValue = async () => {
  const response = await instance.get("/attributes_values");
  return response.data.map((value) => ({
    ...value,
    attribute_name: value.attribute_id === 1 ? "Màu" : "Size", // Tùy chỉnh theo bảng của bạn
  })); // Trả về data từ BE
};

const createValue = async (payload) => {
  const response = await instance.post("/attributes_values", payload);
  return response.data;
};

const deleteValue = async (id) => {
  const response = await instance.delete(`/attributes_values/${id}`);
  return response.data;
};

// Xuất các hàm để dùng trong các component
export const AttributesServices = {
  fetchValue,
  createValue,
  deleteValue,
};
