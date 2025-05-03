import { ArrowRightOutlined, BookOutlined, CheckOutlined, CommentOutlined, MenuOutlined, PrinterOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Image, Input, Modal, Skeleton, Table, Radio, Tabs, Tooltip, notification, Form, Row, Col, Select, Upload } from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OrderService } from "../services/order";
import { paymentServices } from "../services/payments";
import { useQuery } from "@tanstack/react-query";
import echo from "../echo";
import logo from "../assets/images/logo.png";
import axios from "axios";
const { TabPane } = Tabs;

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const handleCancel = () => setIsPaymentModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [orderInfo, setOrderInfo] = useState({
    email: "",
    address: "",
    fullname: "",
    payment_id: "",
    shipping_fee: "",
    discount_points: "",
    total_amount: "",
    coupon_discount_value: "",
    coupon_discount_type: "",
  });
  const [activeTab, setActiveTab] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const hideCancel = () => setIsCancelModalVisible(false);
  const [form] = Form.useForm();
  const [banks, setBanks] = useState([]);
  const [image, setImage] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isCustomReason, setIsCustomReason] = useState(false);

  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const showModal = async (order) => {
    setIsModalVisible(true);
    setSelectedOrderId(order.id);
    setOrderInfo({
      email: order.email,
      address: order.address,
      fullname: order.fullname,
      payment_id: order.payment_id,
      discount_points: order.discount_points,
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
      coupon_discount_value: order.coupon_discount_value,
      coupon_discount_type: order.coupon_discount_type,
    });
    const orderDetails = await OrderService.getOrderById(order.id);
    setOrderDetails(orderDetails);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await OrderService.getOrderByIdUser(id);
        setOrders(response.orders);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        notification.error({
          message: "Error",
          description: "Unable to load orders.",
        });
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [id]);

  const handleSearch = async (keyword) => {
    setSearchKeyword(keyword);
    try {
      setIsLoading(true);
      if (keyword.trim()) {
        const response = await OrderService.searchOrders(keyword);
        setOrders(response);
      } else {
        const response = await OrderService.getOrderByIdUser(id);
        setOrders(response.orders);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error searching orders:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const channel = echo.channel("order-status-channel");
    channel.listen(".order-status-updated", (e) => {
      console.log("📦 Order updated in real-time:", e);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === e.order_id
            ? {
              ...order,
              status: { id: e.status_id, name: getStatusName(e.status_id) },
              updated_at: e.updated_at,
            }
            : order
        )
      );
    });
    return () => {
      echo.leave("order-status-channel");
    };
  }, []);

  const statusTabs = [
    { id: 2, label: "Đã thanh toán" },
    { id: 3, label: "Đang xử lý" },
    { id: 4, label: "Đang giao hàng" },
    { id: 5, label: "Đã giao hàng" },
    { id: 6, label: "Giao hàng thất bại" },
    { id: 7, label: "Hoàn thành" },
    { id: 8, label: "Hủy đơn" },
    { id: 9, label: "Trả hàng" },
  ];

  const countOrdersByStatus = (statusId) => {
    if (statusId === 9) {
      return orders.filter((order) => order.status?.id >= 9).length;
    }
    return orders.filter((order) => order.status?.id === statusId).length;
  };

  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    payment: null,
  });

  const filteredOrders = orders.filter((order) => {
    const { dateRange, status, payment } = filters;
    const orderDate = dayjs(order.created_at);
    const isDateValid =
      !dateRange ||
      (orderDate.isSameOrAfter(dateRange[0], "day") &&
        orderDate.isSameOrBefore(dateRange[1], "day"));
    const isStatusValid = !status || order.status?.id === status;
    const isPaymentValid = !payment || order.payment?.id === payment;
    const isTabMatch =
      !activeTab ||
      (activeTab === 9
        ? order.status?.id >= 9
        : order.status?.id === activeTab);
    const isSearchMatch = order.code
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    return (
      isDateValid &&
      isStatusValid &&
      isPaymentValid &&
      isTabMatch &&
      isSearchMatch
    );
  });

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const response = await paymentServices.getPayment();
      return response.filter(
        (method) =>
          method.name.toLowerCase() === "momo" ||
          method.name.toLowerCase() === "vnpay"
      );
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await OrderService.getAllStatus();
      return response.data;
    },
  });

  const getStatusName = (id) => {
    const found = statusData?.find((s) => s.id === id);
    return found ? found.name : "Đang cập nhật...";
  };

  const handleRetryPayment = async (orderId, paymentMethodName = null) => {
    try {
      const selectedOrder = orders.find((order) => order.id === orderId);
      if (!selectedOrder) {
        notification.error({
          message: "Error",
          description: "Order not found!",
        });
        return;
      }
      if (selectedOrder.status.id !== 1) {
        notification.error({
          message: "Error",
          description: "Order cannot be paid again due to its current status.",
        });
        return;
      }
      const totalMomo =
        paymentMethodName === "momo" ? selectedOrder.total_amount : undefined;
      const response = await OrderService.retryPayment(
        orderId,
        paymentMethodName,
        totalMomo
      );
      if (response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        notification.error({
          message: "Error",
          description: "No payment URL received.",
        });
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      notification.error({
        message: "Error",
        description: "Unable to retry payment.",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      notification.error({
        message: "Error",
        description: "Please select a payment method!",
      });
      return;
    }
    const selectedMethod = payments.find(
      (method) => method.id === selectedPayment
    );
    const paymentMethodName = selectedMethod
      ? selectedMethod.name.toLowerCase()
      : null;
    if (!paymentMethodName) {
      notification.error({
        message: "Error",
        description: "Invalid payment method!",
      });
      return;
    }
    await handleRetryPayment(selectedOrderId, paymentMethodName);
    setIsPaymentModalVisible(false);
    setSelectedPayment(null);
  };

  const handleMarkAsReceived = (orderId) => {
    Modal.confirm({
      title: "Xác nhận đã nhận hàng",
      content:
        "Để hỗ trợ đổi trả hàng, hãy quay lại video khi bạn mở kiện hàng nhé!",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const payload = {
            order_status_id: 7,
            note: "",
            employee_evidence: "",
          };
          const response = await OrderService.updateOrderStatus(
            orderId,
            payload
          );
          if (
            response &&
            response.message === "Cập nhật trạng thái đơn hàng thành công"
          ) {
            notification.success({
              message: "Cảm ơn bạn đã tin tưởng Molla Shop",
              description: "Hãy đánh giá sản phẩm của bạn tại đây!",
            });
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === orderId
                  ? { ...order, status: { id: 7, name: "Hoàn thành" } }
                  : order
              )
            );
            // navigate(`/review/${orderId}`);
          } else {
            notification.error({
              message: "Update Failed",
              description: "An error occurred while updating order status.",
            });
          }
        } catch (error) {
          console.error("Error updating order status:", error);
          notification.error({
            message: "Error",
            description: "Unable to update order status.",
          });
        }
      },
    });
  };

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const payload = {
            order_status_id: 8,
            note: "",
            employee_evidence: "",
          };
          const response = await OrderService.updateOrderStatus(
            orderId,
            payload
          );
          if (
            response &&
            response.message === "Cập nhật trạng thái đơn hàng thành công"
          ) {
            notification.success({
              message: "Đơn hàng đã được hủy",
              description: "Đơn hàng của bạn đã được hủy thành công.",
            });
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === orderId
                  ? { ...order, status: { id: 8, name: "Hủy đơn" } }
                  : order
              )
            );
          } else {
            notification.error({
              message: "Update Failed",
              description: "An error occurred while canceling the order.",
            });
          }
        } catch (error) {
          console.error("Error canceling order:", error);
          notification.error({
            message: "Error",
            description: "Unable to cancel the order.",
          });
        }
      },
    });
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get("https://api.vietqr.io/v2/banks");
        setBanks(res.data.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ngân hàng:", err);
      }
    };
    fetchBanks();
  }, []);

  // Hàm hiển thị modal hủy đơn
  const showCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsCancelModalVisible(true);
  };

  const handleSubmitCancel = async () => {
    try {
      const formValues = await form.validateFields();
      const { bank_account_number, bank_name, bank_qr } = formValues;

      if (!returnReason) {
        notification.error({
          message: "Error",
          description: "Vui lòng chọn hoặc nhập lý do hủy đơn!",
        });
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      if (!userId) {
        notification.error({
          message: "Error",
          description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!",
        });
        return;
      }

      const payload = {
        order_id: selectedOrderId,
        bank_account_number,
        bank_name,
        bank_qr: bank_qr || null,
        reason: returnReason, // Sử dụng trực tiếp returnReason
        user_id: userId,
      };

      const response = await OrderService.cancelRequest(payload);

      notification.success({
        message: "Thành công",
        description: "Gửi yêu cầu hủy đơn thành công.",
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: { id: 8, name: "Hủy đơn" } }
            : order
        )
      );

      setTimeout(() => {
        setIsCancelModalVisible(false);
        form.resetFields();
        setReturnReason("");
        setIsCustomReason(false);
        setImage("");
      }, 1000);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Không thể gửi yêu cầu hủy đơn. Vui lòng thử lại sau!",
      });
    }
  };

  const onHandleBank = (info) => {
    if (info.file.status === "done" && info.file.response) {
      const imageUrl = info.file.response.secure_url;
      setImage(imageUrl);
      form.setFieldsValue({ bank_qr: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
    } else if (info.file.status === "removed") {
      setImage(""); // Xóa ảnh khi người dùng xóa
      form.setFieldsValue({ bank_qr: "" }); // Cập nhật lại giá trị trong form
    }
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const orderStatus = selectedOrder ? selectedOrder.status?.id : null;

  const isWithinSevenDays = (updatedAt) => {
    const updatedDate = dayjs(updatedAt);
    const currentDate = dayjs();
    const diffInDays = currentDate.diff(updatedDate, "day");
    return diffInDays <= 7;
  };

  const detailColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product",
      align: "center",
      render: (_, record) => {
        const thumbnail =
          record.variants?.[0]?.variant_thumbnail || record.thumbnail;
        const productName = record.name || "";
        const variantAttributes =
          record.variants
            ?.map((variant) => {
              const attributes = variant.attributes
                .map((attr) => attr.attribute_name)
                .join(" - ");
              return `${productName} - ${attributes}`;
            })
            .join(", ") || productName;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to={`/product-detail/${record.product_id}`}>
              <span>{variantAttributes}</span>
            </Link>
          </div>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Giá bán (VNĐ)",
      dataIndex: "sell_price",
      align: "center",
      render: (sell_price) => (sell_price ? formatPrice(sell_price) : ""),
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "total",
      align: "center",
      render: (_, record) => formatPrice(record.quantity * record.sell_price),
    },
  ];

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Giá trị đơn hàng (VNĐ)",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      width: 130,
      render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) =>
        created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payment",
      align: "center",
      width: 130,
      render: (payment) => {
        const paymentName =
          payment?.name === "COD"
            ? "Thanh toán khi nhận hàng"
            : payment?.name === "VNPAY"
              ? "Thanh toán qua VNPay"
              : payment?.name === "MOMO"
                ? "Thanh toán qua Momo"
                : payment?.name;
        return <span>{paymentName}</span>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <div
          className={
            [8, 9, 11].includes(status?.id)
              ? "action-link-red"
              : "action-link-blue"
          }
        >
          {status?.name}
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, item) => {
        const { status } = item;
        const isCheckout = status?.id === 1;
        const isDelivered = status?.id === 5; // Đã giao hàng
        const isCompleted = status?.id === 7; // Hoàn thành

        const orderItems = item.order_items;

        const allReviewed = orderItems?.length > 0 ? orderItems.every(item => item.has_reviewed === 1) : true;

        const canReview = !allReviewed;

        return (
          <div className="action-container">
            <Tooltip title="Hóa đơn">
              <Button
                color="purple"
                variant="solid"
                icon={<PrinterOutlined />}
                onClick={() => showModal(item)}
              />
            </Tooltip>

            {isDelivered && (
              <Tooltip title="Đã nhận hàng">
                <Button
                  color="primary"
                  variant="solid"
                  icon={<CheckOutlined />}
                  onClick={() => handleMarkAsReceived(item.id)}
                />
              </Tooltip>
            )}

            {isCompleted && (
              <Tooltip title="Đánh giá">
                <Button
                  color="primary"
                  variant="solid"
                  disabled={!(isCompleted && canReview)}
                  icon={<CommentOutlined />}
                  onClick={() => navigate(`/dashboard/review/${item.id}`)}
                />
              </Tooltip>
            )}

            {isCheckout && (
              <Tooltip title="Tiếp tục thanh toán">
                <Button
                  color="primary"
                  variant="solid"
                  icon={<ArrowRightOutlined />}
                  onClick={() => {
                    setSelectedOrderId(item.id);
                    setIsPaymentModalVisible(true);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    }
  ]

  return (
    <div>
      <h1 className="mb-5" style={{ color: "#eea287" }}>
        <BookOutlined style={{ marginRight: "8px" }} />
        Đơn hàng của bạn
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <Tooltip title="Toàn bộ đơn hàng">
          <Button onClick={() => setActiveTab(null)} icon={<MenuOutlined />} />
        </Tooltip>
        <Input
          style={{ width: "400px" }}
          placeholder="Tìm kiếm mã đơn hàng..."
          allowClear
          value={searchKeyword}
          onSearch={(value) => handleSearch(value)}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>
      <Tabs
        onChange={(key) => setActiveTab(parseInt(key))}
        activeKey={activeTab?.toString() || ""}
        type="scrollable"
      >
        {statusTabs.map((tab) => (
          <TabPane
            tab={`${tab.label} (${countOrdersByStatus(tab.id)})`}
            key={tab.id.toString()}
          />
        ))}
      </Tabs>
      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      </Skeleton>
      <Modal
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        width={500}
      >
        <div id="invoiceModalContent">
          <div className="form-name">
            <img className="logo-bill" src={logo} alt="Molla Shop" />
          </div>
          <span className="text-title">
            Khách hàng: <span className="text-name">{orderInfo.fullname}</span>
          </span>
          <br />
          <span className="text-title">
            Email: <span className="text-name">{orderInfo.email}</span>
          </span>
          <br />
          <span className="text-title">
            Địa chỉ: <span className="text-name">{orderInfo.address}</span>
          </span>
          <Table
            style={{ marginTop: "20px" }}
            columns={detailColumns}
            dataSource={orderDetails.map((item) => ({
              ...item,
              product_name: item.product?.name,
            }))}
            pagination={false}
            summary={() => {
              const totalAmount = orderDetails.reduce(
                (sum, item) => sum + item.quantity * item.sell_price,
                0
              );
              const isPercentDiscount =
                orderInfo.coupon_discount_type === "percent";
              const discountValue = isPercentDiscount
                ? (totalAmount * orderInfo.coupon_discount_value) / 100 || 0
                : orderInfo.coupon_discount_value || 0;
              return (
                <>
                  <Table.Summary.Row style={{ lineHeight: "1" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Tổng tiền hàng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(totalAmount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row style={{ lineHeight: "1.2" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Phiếu giảm giá:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {isPercentDiscount
                        ? `${formatPrice(discountValue)} (${orderInfo.coupon_discount_value
                        }%)`
                        : formatPrice(discountValue)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row style={{ lineHeight: "1" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Phí vận chuyển:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(orderInfo.shipping_fee)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row style={{ lineHeight: "1" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Giảm giá điểm tiêu dùng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(orderInfo.discount_points)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row style={{ lineHeight: "1" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      <strong>Tổng thanh toán:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      <strong>{formatPrice(orderInfo.total_amount)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row style={{ lineHeight: "1" }}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      <strong>Số tiền cần trả:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      <strong>
                        {orderInfo.payment_id === 2
                          ? formatPrice(orderInfo.total_amount)
                          : formatPrice(0)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
          <div className="form-thank">
            <span className="text-thank">
              Cảm ơn quý khách đã tin tưởng Molla Shop!
            </span>
            <br />
            <span className="text-name">Hẹn gặp lại</span>
          </div>
        </div>

        <div className="add">
          {((orderStatus === 7) && isWithinSevenDays(selectedOrder?.updated_at)) && (
            <Link to={`/dashboard/return/${selectedOrderId}`}>
              <Button color="danger" variant="solid">
                Trả hàng
              </Button>
            </Link>
          )}

          {(orderStatus === 1 || orderStatus === 2 || orderStatus === 3) && (
            <>
              {orderInfo.payment_id === 2 ? (
                <Button
                  color="danger"
                  variant="solid"
                  onClick={() => handleCancelOrder(selectedOrderId)}
                >
                  Hủy đơn
                </Button>
              ) : (orderInfo.payment_id === 1 || orderInfo.payment_id === 3) ? (
                <Button
                  color="danger"
                  variant="solid"
                  onClick={() => showCancelModal(selectedOrderId)}
                >
                  Hủy đơn
                </Button>
              ) : null}
            </>
          )}
        </div>
      </Modal>

      <Modal
        title="Chọn phương thức thanh toán"
        visible={isPaymentModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Radio.Group
          onChange={(e) => setSelectedPayment(e.target.value)}
          value={selectedPayment}
        >
          {payments?.map((method) => (
            <Radio
              key={method.id}
              value={method.id}
              style={{ display: "block", marginBottom: "10px" }}
            >
              {method.name.toLowerCase() === "vnpay"
                ? "Thanh toán qua VNPay"
                : method.name.toLowerCase() === "momo"
                  ? "Thanh toán qua Momo"
                  : method.name}
            </Radio>
          ))}
        </Radio.Group>

        <div className="add">
          <Button
            key="submit"
            type="primary"
            onClick={handleConfirmPayment}
            style={{ backgroundColor: "#eea287", borderColor: "#eea287" }}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>

      <Modal
        title="Hủy đơn hàng"
        visible={isCancelModalVisible}
        onCancel={() => {
          setIsCancelModalVisible(false);
          form.resetFields();
          setReturnReason("");
          setIsCustomReason(false);
          setImage("");
        }}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmitCancel}
        >
          <Row gutter={24}>
            <Col span={24} className="col-item">
              <Form.Item
                label="Ngân hàng"
                name="bank_name"
                rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
              >
                <Select
                  className="input-item"
                  allowClear
                  showSearch
                  placeholder="Chọn ngân hàng"
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {banks.map((bank) => (
                    <Select.Option key={bank.code} value={bank.name} label={bank.name}>
                      <div className="select-option-item">
                        <img src={bank.logo} alt={bank.name} style={{ width: '100px' }} />
                        <span>{bank.name}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item
                label="Số tài khoản"
                name="bank_account_number"
                rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
              >
                <Input
                  className="input-item"
                  placeholder="Nhập số tài khoản"
                />
              </Form.Item>

              <Form.Item label="QR ngân hàng (nếu có)" name="bank_qr">
                <Upload
                  listType="picture"
                  action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                  data={{ upload_preset: "quangOsuy" }}
                  onChange={onHandleBank}
                  maxCount={1}
                >
                  {!image && (
                    <Button icon={<UploadOutlined />} className="btn-item">
                      Tải ảnh lên
                    </Button>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12} className="col-item">
              <Form.Item
                label="Lý do hủy đơn"
                name="reason"
                rules={[{ required: true, message: "Vui lòng chọn lý do hủy đơn" }]}
              >
                <Radio.Group
                  value={returnReason}
                  onChange={(e) => {
                    const value = e.target.value;
                    setReturnReason(value);
                    if (value === "Khác") {
                      setIsCustomReason(true);
                      setReturnReason("");
                      form.setFieldsValue({ reason: "" });
                    } else {
                      setIsCustomReason(false);
                      form.setFieldsValue({ reason: value });
                    }
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <Radio value="Tôi đặt nhầm sản phẩm">Tôi đặt nhầm sản phẩm</Radio>
                  <Radio value="Tôi tìm thấy ưu đãi tốt hơn">Tôi tìm thấy ưu đãi tốt hơn</Radio>
                  <Radio value="Tôi muốn đổi size/màu">Tôi muốn đổi size/màu</Radio>
                  <Radio value="Khác">Khác</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              {isCustomReason && (
                <Form.Item
                  label="Nhập lý do hủy đơn"
                  name="customReason"
                  rules={[{ required: true, message: "Vui lòng nhập lý do hủy đơn" }]}
                >
                  <Input.TextArea
                    value={returnReason}
                    onChange={(e) => {
                      setReturnReason(e.target.value);
                      form.setFieldsValue({ reason: e.target.value });
                    }}
                    placeholder="Nhập lý do hủy đơn tại đây..."
                    rows={3}
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          <div className="add">
            <Button
              color="danger"
              variant="solid"
              htmlType="submit"
              style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
