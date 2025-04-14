import {
  ArrowRightOutlined,
  BookOutlined,
  CheckOutlined,
  EyeOutlined,
  MenuOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Image,
  Input,
  Modal,
  Skeleton,
  Table,
  Radio,
  Tabs,
  Tooltip,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OrderService } from "../services/order";
import { paymentServices } from "../services/payments";
import { useQuery } from "@tanstack/react-query";
import echo from "../echo";
import logo from "../assets/images/logo.png";

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

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

  const hideModal = () => setIsModalVisible(false);

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
            navigate(`/review/${orderId}`);
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

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const orderStatus = selectedOrder ? selectedOrder.status?.id : null;

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
            <Image src={thumbnail} width={60} />
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
        const isDelivered = status?.id === 5;
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
    },
  ];

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
          {(orderStatus === 5 || orderStatus === 7) && (
            <Link to={`/dashboard/return/${selectedOrderId}`}>
              <Button color="danger" variant="solid">
                Trả hàng
              </Button>
            </Link>
          )}
          {(orderStatus === 1 || orderStatus === 2 || orderStatus === 3) && (
            <Button
              color="danger"
              variant="solid"
              onClick={() => handleCancelOrder(selectedOrderId)}
            >
              Hủy đơn
            </Button>
          )}
        </div>
      </Modal>
      <Modal
        title="Chọn phương thức thanh toán"
        visible={isPaymentModalVisible}
        onCancel={() => {
          setIsPaymentModalVisible(false);
          setSelectedPayment(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsPaymentModalVisible(false);
              setSelectedPayment(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleConfirmPayment}
            style={{ backgroundColor: "#eea287", borderColor: "#eea287" }}
          >
            Xác nhận
          </Button>,
        ]}
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
      </Modal>
    </div>
  );
};

export default Orders;
