import instance from "../axios"; // axios instance với base URL

const fetchAttributes = async () => {
    const response = await instance.get("/attributes");
    return response.data; // Trả về data từ BE
};

const fetchAttributeById = async (id) => {
    const response = await instance.get(`/attributes/${id}`);
    return response.data;
};

const createAttribute = async (payload) => {
    const response = await instance.post("/attributes", payload);
    return response.data;
};

const updateAttribute = async (id, payload) => {
    const response = await instance.put(`/attributes/${id}`, payload);
    return response.data;
};

const deleteAttribute = async (id) => {
    const response = await instance.delete(`/attributes/${id}`);
    return response.data;
};

// Xuất các hàm để dùng trong các component
export const AttributesServices = {
    fetchAttributes,
    fetchAttributeById,
    createAttribute,
    updateAttribute,
    deleteAttribute,
};
