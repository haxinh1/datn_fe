import instance from "../axios";

const fetchProduct = async () => {
  try {
    const { data } = await instance.get("/products");
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createProduct = async (payload) => {
  try {
    const { data } = await instance.post("/products", payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchProductById = async (id) => {
  try {
    const { data } = await instance.get(`/products/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateProduct = async (id, payload) => {
  try {
    const { data } = await instance.put(`/products/${id}`, payload);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteProduct = async (id) => {
  try {
    const { data } = await instance.delete(`/products/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const productsServices = {
  fetchProduct,
  createProduct,
  fetchProductById,
  updateProduct,
  deleteProduct,
};
