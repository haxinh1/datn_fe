import instance from "../axios";

const getPayment = async () => {
  const response = await instance.get("/payments");
  return response.data;
};

const createPaymentVNP = async ({
  orderId,
  paymentMethod,
  userId, // thêm userId vào đây
  bankCode = null,
}) => {
  const response = await instance.post("/payments/vnpay", {
    order_id: orderId,
    payment_method: paymentMethod,
    user_id: userId, // đảm bảo backend nhận được user_id
    bank_code: bankCode,
  });

  if (response.data.payment_url) {
    window.location.href = response.data.payment_url; // Redirect to VNPAY
  }

  return response.data;
};

export const paymentServices = {
  getPayment,
  createPaymentVNP,
};
