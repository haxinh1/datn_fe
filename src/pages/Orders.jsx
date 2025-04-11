import {
  ArrowRightOutlined,
  BookOutlined,
  CheckOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Image,
  Modal,
  Radio,
  Select,
  Skeleton,
  Table,
  Tooltip,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OrderService } from "../services/order";
import { paymentServices } from "../services/payments";
import { useQuery } from "@tanstack/react-query";
import viVN from "antd/es/locale/vi_VN";
import echo from "../echo";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { RangePicker } = DatePicker;
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
    shipping_fee: "",
    discount_points: "",
    total_amount: "",
  });
  const navigate = useNavigate();

  // Tách số thành định dạng tiền tệ
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
      discount_points: order.discount_points,
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
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
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách đơn hàng.",
        });
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const channel = echo.channel("order-status-channel");

    channel.listen(".order-status-updated", (e) => {
      console.log("📦 Đơn hàng được cập nhật realtime:", e);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === e.order_id
            ? {
                ...order,
                status: {
                  id: e.status_id,
                  name: getStatusName(e.status_id),
                },
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

  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    payment: null,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredOrders = orders.filter((order) => {
    const { dateRange, status, payment } = filters;
    const orderDate = dayjs(order.created_at);
    const isDateValid =
      !dateRange ||
      (orderDate.isSameOrAfter(dateRange[0], "day") &&
        orderDate.isSameOrBefore(dateRange[1], "day"));
    const isStatusValid = !status || order.status?.id === status;
    const isPaymentValid = !payment || order.payment?.id === payment;
    return isDateValid && isStatusValid && isPaymentValid;
  });

  // Lấy danh sách phương thức thanh toán (chỉ Momo và VNPay)
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

  // Danh sách trạng thái
  const { data: statusData } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await OrderService.getAllStatus();
      return response.data;
    },
  });
  const status = statusData ? [...statusData].sort((a, b) => a.id - b.id) : [];
  const getStatusName = (id) => {
    const found = statusData?.find((s) => s.id === id);
    return found ? found.name : "Đang cập nhật...";
  };

  // Hàm xử lý khi nhấn xác nhận phương thức thanh toán
  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn phương thức thanh toán!",
      });
      return;
    }

    try {
      // Tìm phương thức thanh toán được chọn từ danh sách payments
      const selectedMethod = payments.find(
        (method) => method.id === selectedPayment
      );
      const paymentMethodName = selectedMethod
        ? selectedMethod.name.toLowerCase()
        : null;

      if (!paymentMethodName) {
        notification.error({
          message: "Lỗi",
          description: "Phương thức thanh toán không hợp lệ!",
        });
        return;
      }

      // Gọi API retryPayment với payment_method là tên (vnpay hoặc momo)
      const response = await OrderService.retryPayment(
        selectedOrderId,
        paymentMethodName
      );
      if (response.payment_url) {
        window.location.href = response.payment_url;
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán lại:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể thanh toán lại đơn hàng.",
      });
    } finally {
      setIsPaymentModalVisible(false);
      setSelectedPayment(null);
    }
  };

  // Hàm xác nhận đã nhận hàng
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
              message: "Cập nhật thất bại",
              description: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
            });
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể cập nhật trạng thái đơn hàng.",
          });
        }
      },
    });
  };

  // Hàm xác nhận hủy đơn
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
              message: "Cập nhật thất bại",
              description: "Có lỗi xảy ra khi hủy đơn hàng.",
            });
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể hủy đơn hàng.",
          });
        }
      },
    });
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId);
  const orderStatus = selectedOrder ? selectedOrder.status?.id : null;

  const detailColumns = [
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
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
            ? "Thanh toán trực tuyến"
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
          className={status?.id >= 8 ? "action-link-red" : "action-link-blue"}
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
            <Tooltip title="Chi tiết đơn hàng">
              <Button
                color="purple"
                variant="solid"
                icon={<EyeOutlined />}
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
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
      >
        <span>
          Email: <span className="text-quest">{orderInfo.email}</span>
        </span>{" "}
        <br />
        <span>
          Địa chỉ nhận hàng:{" "}
          <span className="text-quest">{orderInfo.address}</span>
        </span>
        <Table
          columns={detailColumns}
          dataSource={orderDetails.map((item, index) => ({
            ...item,
            key: index,
            index: index + 1,
            product_name: item.product?.name,
          }))}
          pagination={false}
          summary={() => {
            const totalAmount = orderDetails.reduce(
              (sum, item) => sum + item.quantity * item.sell_price,
              0
            );
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    Tổng tiền:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    {formatPrice(totalAmount)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    Phí vận chuyển:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    {formatPrice(orderInfo.shipping_fee)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    Giảm giá điểm tiêu dùng:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    {formatPrice(orderInfo.discount_points)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>

                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    <strong>Tổng giá trị đơn hàng:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    <strong>{formatPrice(orderInfo.total_amount)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
        <div className="add">
          {(orderStatus === 5 || orderStatus === 7) && (
            <Link to={`/dashboard/return/${selectedOrderId}`}>
              <Button
                color="danger"
                variant="solid"
                style={{ marginRight: "10px" }}
              >
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
