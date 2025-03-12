import instance from "../axios";

const getPayment = async () => {
  const response = await instance.get("/payments");
  return response.data;
};

const createPaymentVNP = async ({
  orderId,
  paymentMethod,
  bankCode = null,
}) => {
  const response = await instance.post("/payments/vnpay", {
    order_id: orderId,
    payment_method: paymentMethod, // Make sure this matches what the backend expects ('vnpay')
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
