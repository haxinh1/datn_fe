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

const createPaymentMomo = async ({ orderId, totalMomo }) => {
  try {
    const response = await instance.post("/momo/payment", {
      order_id: orderId,
      total_momo: totalMomo, // Đảm bảo totalMomo được gửi đúng như yêu cầu từ backend
    });

    // Kiểm tra nếu trả về payment_url
    if (response.data.payment_url) {
      window.location.href = response.data.payment_url; // Chuyển hướng người dùng tới trang thanh toán MoMo
    }

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán MoMo:", error);
    throw new Error("Đã có sự cố khi tạo thanh toán MoMo");
  }
};
export const paymentServices = {
  getPayment,
  createPaymentVNP,
  createPaymentMomo, // Thêm phương thức MoMo vào dịch vụ thanh toán
};
