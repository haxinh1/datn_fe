import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { paymentServices } from './../services/payments';


const Payments = () => {
  const location = useLocation();
  const { orderId, totalAmount, fullName, phoneNumber, Email, Address } =
    location.state || {};
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [payMents, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    console.log("orderId:", orderId);
    console.log("totalAmount:", totalAmount);
    console.log("Email:", Email);
    console.log("phoneNumber:", phoneNumber);
    console.log("fullName:", fullName);
    console.log("Address:", Address);
    if (!orderId || !totalAmount) {
      setErrorMessage("Không có thông tin đơn hàng. Vui lòng thử lại.");
    }
  }, [orderId, totalAmount, Email, phoneNumber, fullName, Address]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const payData = await paymentServices.getPayment();
        setPayments(payData);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        setErrorMessage("Không thể lấy phương thức thanh toán.");
      }
    };
    fetchPayments();
  }, []);

  const handlePayment = async () => {
    if (!selectedPayment) {
      setErrorMessage("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (selectedPayment === 1) {
      setSuccessMessage("Thanh toán thành công!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const paymentData = {
        orderId,
        paymentMethod: selectedPayment === 2 ? "vnpay" : "",
        paymentId: selectedPayment,
        bankCode: null,
      };

      console.log("🔍 Data being sent to API:", paymentData);

      const response = await paymentServices.createPaymentVNP(paymentData);

      if (response && response.data.payment_url) {
        console.log("✅ Redirecting to:", response.data.payment_url);
        window.location.href = response.data.payment_url;
      } else {
        setErrorMessage("Lỗi tạo liên kết thanh toán.");
      }
    } catch (error) {
      console.error("❌ Payment error:", error.response?.data || error);
      setErrorMessage(
        error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <main
        role="main"
        className="container p-4 shadow-lg rounded bg-white"
        style={{ maxWidth: "800px" }}
      >
        <form
          action="#"
          className="needs-validation"
          method="post"
          name="frmthanhtoan"
        >
          <input defaultValue="dnpcuong" name="kh_tendangnhap" type="hidden" />
          <div className="py-5 text-center">
            <i
              aria-hidden="true"
              className="fa fa-credit-card fa-4x text-primary"
            />
            <h2 className="text-primary">Thanh toán</h2>
            <p className="lead">
              Vui lòng kiểm tra thông tin Khách hàng, thông tin Giỏ hàng trước
              khi Đặt hàng.
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="row">
            <div className="col-md-12">
              <h2 className="mb-4 text-primary">Thông tin khách hàng</h2>

              <div className="row">
                {/* Họ */}
                <div className="col-md-6">
                  <label htmlFor="kh_ho">Họ</label>
                  <input
                    className="form-control"
                    value={fullName?.split(" ").slice(0, -1).join(" ") || ""}
                    readOnly
                    type="text"
                  />
                </div>

                {/* Tên */}
                <div className="col-md-6">
                  <label htmlFor="kh_ten">Tên</label>
                  <input
                    className="form-control"
                    value={fullName?.split(" ").slice(-1).join(" ") || ""}
                    readOnly
                    type="text"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="col-md-12">
                  <label htmlFor="kh_sdt">Số điện thoại</label>
                  <input
                    className="form-control"
                    value={phoneNumber}
                    readOnly
                    type="text"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="col-md-12">
                  <label htmlFor="kh_diachi">Địa chỉ</label>
                  <input
                    className="form-control"
                    value={Address}
                    readOnly
                    type="text"
                  />
                </div>

                {/* Tổng tiền */}
                <div className="col-md-12">
                  <label htmlFor="kh_tongtien">Tổng tiền</label>
                  <input
                    className="form-control"
                    value={totalAmount}
                    readOnly
                    type="text"
                  />
                </div>
              </div>

              <h4 className="mb-3 text-primary">Hình thức thanh toán</h4>
              <div className="d-block my-3">
                {payMents.length > 0 ? (
                  payMents.map((method) => (
                    <div
                      key={method.id}
                      className="custom-control custom-radio"
                    >
                      <input
                        className="custom-control-input"
                        id={`httt-${method.id}`}
                        name="paymentMethod"
                        type="radio"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        required
                      />
                      <label
                        className="custom-control-label"
                        htmlFor={`httt-${method.id}`}
                      >
                        {method.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-center font-italic">
                    Loading payment methods...
                  </p>
                )}
              </div>

              <hr className="mb-4" />

              {!paymentUrl ? (
                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Đang tạo liên kết thanh toán..." : "Thanh toán"}
                </button>
              ) : (
                <div>
                  <p>Đang chuyển hướng đến VNPay...</p>
                  <iframe
                    src={paymentUrl}
                    style={{ width: "100%", height: "600px", border: "none" }}
                    title="VNPay Payment"
                  ></iframe>
                </div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Payments;
