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

const updateProduct = async (id, payload) => {
    const response = await instance.put(`/products/${id}`, payload);
    return response.data;
};

// tìm kiếm sản phẩm
const searchProducts = async (keyword) => {
    try {
        const response = await instance.get('/admin/products/search', {
            params: { keyword }, // Truyền từ khóa vào tham số của URL
        });

        if (response.data.success) {
            return response.data.data; // Trả về danh sách sản phẩm
        } else {
            return []; // Nếu không tìm thấy sản phẩm, trả về mảng trống
        }
    } catch (error) {
        console.error("Lỗi khi gọi API tìm kiếm sản phẩm:", error);
        throw error; // Nếu có lỗi, ném lại lỗi để xử lý ở nơi gọi
    }
};

// hàm nhập hàng
const importProduct = async (payload) => {
    const response = await instance.post("/postStock", payload);
    return response.data;
};

// lịch sử nhập hàng
const history = async () => {
    const response = await instance.get("/stocks");
    return response.data; // Trả về data từ BE
};

// xác nhận đơn hàng
const confirm = async (id, payload) => {
    const response = await instance.put(`/stocks/${id}`, payload);
    return response.data; // Trả về data từ BE
};

// xuất excel
const exportExcel = async () => {
    const response = await instance.get('/export-product-stocks')
    return response.data;
}

// Xuất các hàm để dùng trong các component
export const productsServices = {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    searchProducts,
    importProduct,
    history,
    confirm,
    exportExcel
};
