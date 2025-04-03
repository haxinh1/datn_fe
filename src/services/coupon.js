import instance from "../axios";

const fetchCoupons = async () => {
  try {
    const { data } = await instance.get("/coupons");
    return data;
  } catch (error) {
    console.log(error);
  }
};
const getCounponById = async (id, userId) => {
  try {
    const { data } = await instance.get(`/coupons`, {
      params: {
        user_id: userId, // Thêm tham số user_id vào URL
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
const createCoupon = async (payload) => {
  try {
    const { data } = await instance.post("/coupons/create", payload);
    return data;
  } catch (error) {
    console.log(error);
  }
};
const updateCoupon = async (id, payload) => {
  try {
    const { data } = await instance.put(`/coupons/${id}`, payload);
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const CouponServices = {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  getCounponById,
};
