import instance from "../axios"; // axios instance với base URL

const fetchBrands = async () => {
    const response = await instance.get("/brands");
    return response.data; // Trả về data từ BE
};

const fetchBrandById = async (id) => {
    const response = await instance.get(`/brands/${id}`);
    return response.data;
};

const createBrand = async (payload) => {
    const response = await instance.post("/brands", payload);
    return response.data;
};

const updateBrand = async (id, payload) => {
    const response = await instance.put(`/brands/${id}`, payload);
    return response.data;
};

const deleteBrand = async (id) => {
    const response = await instance.delete(`/brands/${id}`);
    return response.data;
};

// Xuất các hàm để dùng trong các component
export const BrandsServices = {
    fetchBrands,
    fetchBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
