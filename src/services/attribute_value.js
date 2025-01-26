import instance from "../axios"; // axios instance với base URL

const fetchValues = async () => {
    const response = await instance.get("/attributeValue");
    return response.data; // Trả về data từ BE
};

const fetchValueById = async (id) => {
    const response = await instance.get(`/attributeValue/${id}`);
    return response.data;
};

const createValue = async (payload) => {
    const response = await instance.post("/attributeValue", payload);
    return response.data;
};

const updateValue = async (id, payload) => {
    const response = await instance.put(`/attributeValue/${id}`, payload);
    return response.data;
};

const deleteValue = async (id) => {
    const response = await instance.delete(`/attributeValue/${id}`);
    return response.data;
};

// Xuất các hàm để dùng trong các component
export const ValuesServices = {
    fetchValues,
    fetchValueById,
    createValue,
    updateValue,
    deleteValue,
};
