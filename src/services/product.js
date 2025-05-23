import instance from "../axios"; // axios instance với base URL

const fetchProducts = async () => {
    const response = await instance.get("/products");
    return response.data; // Trả về data từ BE
};

const productByCategory = async (categoryId) => {
    const response = await instance.get(`/product-by-category/${categoryId}`);
    return response.data;
}

const ProductById = async (id) => {
    const response = await instance.get(`/products/${id}`);
    return response.data;
};

// const fetchProductById = async (id) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//         throw new Error("Token xác thực không có trong localStorage");
//     }
//     const response = await instance.get(`/product-detail/${id}`,
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         }
//     );
//     return response.data;
// };

const fetchProductById = async (id) => {
    const response = await instance.get(`/product-detail/${id}`);
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

const activeProduct = async (id, payload) => {
    const response = await instance.put(`/products/edit/active/${id}`, payload);
    return response.data;
};

// tìm kiếm sản phẩm
const searchProducts = async (keyword = "") => {
    try {
        const response = await instance.get('/admin/products/search', {
            params: { keyword },
        });

        if (response.data?.success) {
            return response.data.data || []; // Nếu `data` null thì trả về []
        }

        throw new Error(response.data?.message || "Không tìm thấy sản phẩm");
    } catch (error) {
        console.error("Lỗi khi gọi API tìm kiếm sản phẩm:", error);
        return []; // Trả về mảng rỗng thay vì ném lỗi, tránh crash UI
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
const exportExcel = async (orderIds = []) => {
    const response = await instance.post('/export-product-stocks', {
        order_ids: orderIds // Gửi order_ids dưới dạng body của POST request
    });
    return response.data;
}

const fetchProductRecommendById = async (id) => {
    try {
        const { data } = await instance.get(`/product-recommend/${id}`);
        return data;
    } catch (error) {
        console.log(error)
    }
}
// xuất excel
const importExcel = async (formData) => {
    const response = await instance.post('/import-stock', formData);
    return response.data;
}

// Xuất các hàm để dùng trong các component
export const productsServices = {
    fetchProducts,
    productByCategory,
    ProductById,
    fetchProductById,
    createProduct,
    updateProduct,
    activeProduct,
    searchProducts,
    importProduct,
    history,
    confirm,
    exportExcel,
    fetchProductRecommendById,
    importExcel,
};
