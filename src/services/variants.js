import instance from "../axios"; // axios instance với base URL

const fetchVariants = async () => {
    const response = await instance.get("/allVariant");
    return response.data; // Trả về data từ BE
}

const updateVariants = async (id, payload) => {
    const response = await instance.put(`/productVariant/${id}`, payload);
    return response.data;
};

const activeVariants = async (id, payload) => {
    const response = await instance.put(`/productVariant/edit/active/${id}`, payload);
    return response.data;
};

export const variantsServices = {
    fetchVariants,
    updateVariants,
    activeVariants,
}
