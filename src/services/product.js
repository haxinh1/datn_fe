import instance from "../axios"; // axios instance với base URL

const fetchProducts = async () => {
    const response = await instance.get("/products");
    return response.data; // Trả về data từ BE
};

const fetchProductById = async (id) => {
    const response = await instance.get(`/products/${id}`);
    return response.data;
};

const createProduct = async (payload) => {
    const response = await instance.post("/products", payload);
    return response.data;
};

const importProduct = async (payload) => {
    const response = await instance.post("/postStock", payload);
    return response.data;
};

const history = async () => {
    const response = await instance.get("/stocks");
    return response.data; // Trả về data từ BE
};

const updateProduct = async (id, payload) => {
    const response = await instance.put(`/products/${id}`, payload);
    return response.data;
};

const deleteProduct = async (id) => {
    const response = await instance.delete(`/products/${id}`);
    return response.data;
};

// Xuất các hàm để dùng trong các component
export const productsServices = {
    fetchProducts,
    fetchProductById,
    createProduct,
    importProduct,
    history,
    updateProduct,
    deleteProduct,
};
