import instance from "../axios"; // Đảm bảo import đúng file axios của bạn

// Lấy danh sách toàn bộ thuộc tính
const getAllAttributes = async () => {
    try {
        const { data } = await instance.get('/attributes');
        return data;
    } catch (error) {
        console.error('Error in getAllAttributes:', error);
        throw error;
    }
};

// Tạo mới một thuộc tính
const createAttribute = async (payload) => {
    try {
        const { data } = await instance.post('/attributes', payload);
        return data;
    } catch (error) {
        console.error('Error in createAttribute:', error);
        throw error;
    }
};

// Lấy chi tiết một thuộc tính theo ID
const getAttributeById = async (id) => {
    try {
        const { data } = await instance.get(`/attributes/${id}`);
        return data;
    } catch (error) {
        console.error('Error in getAttributeById:', error);
        throw error;
    }
};

// Cập nhật một thuộc tính theo ID
const updateAttribute = async (id, payload) => {
    try {
        const { data } = await instance.put(`/attributes/${id}`, payload);
        return data;
    } catch (error) {
        console.error('Error in updateAttribute:', error);
        throw error;
    }
};

// Xóa một thuộc tính theo ID
const deleteAttribute = async (id) => {
    try {
        const { data } = await instance.delete(`/attributes/${id}`);
        return data;
    } catch (error) {
        console.error('Error in deleteAttribute:', error);
        throw error;
    }
};

// Export tất cả các hàm để sử dụng
export const attributesServices = {
    getAllAttributes,
    createAttribute,
    getAttributeById,
    updateAttribute,
    deleteAttribute,
};
