import instance from "../axios";

const fetchCoupons = async () => {
  try {
    const { data } = await instance.get("/coupons");
    return data;
  } catch (error) {
    console.log(error);
  }
};
const getCounponById = async (id) => {
  try {
    const { data } = await instance.get(`/coupons/${id}`);
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

const getAvailableCoupons = async () => {
  try {
    const { data } = await instance.get("coupons/available/coupons");
    return data;
  } catch (error) {
    console.log(error);
  }
};

const searchCoupons = async (queryParams) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const { data } = await instance.get(
      `/coupons/search/filter?${queryString}`
    );
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
  getAvailableCoupons,
  searchCoupons,
};
