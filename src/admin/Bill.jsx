import { EyeOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, DatePicker, Modal, Select, Skeleton, Table, Tooltip } from "antd";
import React, { useState } from "react";
import { OrderService } from "../services/order";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { paymentServices } from "../services/payments";
import viVN from "antd/es/locale/vi_VN";
import { ConfigProvider } from "antd";
import logo from "../assets/images/logo.png";
import "../css/bill.css";
import html2pdf from "html2pdf.js";

const Bill = () => {
  const { RangePicker } = DatePicker;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState({
    email: "",
    address: "",
    fullname: "",
    shipping_fee: "",
    discount_points: "",
    total_amount: "",
    coupon_discount_value: "",
    coupon_discount_type: "",
  });

  // danh sách hóa đơn
  const { data: bills, isLoading } = useQuery({
    queryKey: ["complete"],
    queryFn: async () => {
      const response = await OrderService.getAllOrder();
      return response.orders || { data: [] };
    },
  });

  const showModal = async (order) => {
    setIsModalVisible(true);
    setSelectedOrderId(order.id);

    // Cập nhật email và địa chỉ của đơn hàng
    setOrderInfo({
      email: order.email,
      address: order.address,
      fullname: order.fullname,
      shipping_fee: order.shipping_fee,
      discount_points: order.discount_points,
      total_amount: order.total_amount,
      coupon_discount_value: order.coupon_discount_value,
      coupon_discount_type: order.coupon_discount_type,
    });

    // Lọc danh sách sản phẩm của đơn hàng từ ordersData
    const orderDetails = await OrderService.getOrderById(order.id);
    setOrderDetails(orderDetails);
  };

  const [filters, setFilters] = useState({
    dateRange: null,
    payment: null,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredOrders = bills?.filter((order) => {
    const { dateRange, payment } = filters;
    const orderDate = dayjs(order.created_at);
    const isDateValid =
      !dateRange ||
      (orderDate.isSameOrAfter(dateRange[0], "day") &&
        orderDate.isSameOrBefore(dateRange[1], "day"));
    const isPaymentValid = !payment || order.payment?.id === payment;
    return isDateValid && isPaymentValid;
  }) || [];

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const printInvoice = () => {
    const element = document.getElementById("invoiceModalContent"); // Lấy nội dung Modal
    const options = {
      margin: 1,
      filename: "hoadon.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a5", orientation: "portrait" },
    };

    html2pdf().from(element).set(options).save(); // Tạo và lưu PDF
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã hóa đơn",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      align: "center",
    },
    {
      title: "Giá trị đơn hàng (VNĐ)",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, item) => (
        <div className="action-container">
          <Tooltip title="Xem hóa đơn">
            <Button
              color="primary"
              variant="solid"
              icon={<PrinterOutlined />}
              onClick={() => showModal(item)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      align: "center",
      render: (text, record) => {
        const productName = record.name ? record.name : "";
        const variantAttributes = record.variants
          .map((variant) => {
            const attributes = variant.attributes
              .map((attr) => attr.attribute_name)
              .join(" - ");
            return `${productName} - ${attributes}`;
          })
          .join(", ");

        return variantAttributes || productName;
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
      title: "Thành tiền (VNĐ)", // ✅ Thêm cột tổng tiền
      dataIndex: "total",
      align: "center",
      render: (_, record) => formatPrice(record.quantity * record.sell_price),
    },
  ];

  return (
    <div>
      <h1 className="mb-5">
        <PrinterOutlined style={{ marginRight: "8px" }} />
        Hóa đơn
      </h1>

      <div className="group1">
        <ConfigProvider locale={viVN}>
          <RangePicker
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            allowClear
          />
        </ConfigProvider>
      </div>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 10 }}
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
            <img className="logo-bill" src={logo} />
          </div>
          <span className="text-title">
            Khách hàng: <span className="text-name">{orderInfo.fullname}</span>
          </span>{" "}
          <br />
          <span className="text-title">
            Email: <span className="text-name">{orderInfo.email}</span>
          </span>{" "}
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

              const isPercentDiscount = orderInfo.coupon_discount_type === "percent";
              const discountValue = isPercentDiscount
                ? (totalAmount * orderInfo.coupon_discount_value) / 100 || 0
                : 0;

              return (
                <>
                  <Table.Summary.Row style={{ lineHeight: '1'}}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Tổng tiền hàng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(totalAmount)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                  <Table.Summary.Row style={{ lineHeight: '1.2'}}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Phiếu giảm giá:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {isPercentDiscount
                        ? `${formatPrice(discountValue)} (${orderInfo.coupon_discount_value}%)`
                        : formatPrice(orderInfo.coupon_discount_value)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                  <Table.Summary.Row style={{ lineHeight: '1'}}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Giảm giá điểm tiêu dùng:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(orderInfo.discount_points)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                  <Table.Summary.Row style={{ lineHeight: '1'}}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      Phí vận chuyển:
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      {formatPrice(orderInfo.shipping_fee)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>

                  <Table.Summary.Row style={{ lineHeight: '1'}}>
                    <Table.Summary.Cell colSpan={3} align="right">
                      <strong>Tổng thanh toán:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                      <strong>{formatPrice(orderInfo.total_amount)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
          <div className="form-thank">
            <span className="text-thank">
              Cảm ơn quý khách đã tin tưởng Molla Shop!
            </span>{" "}
            <br />
            <span className="text-name">Hẹn gặp lại</span>
          </div>
        </div>

        <div className="add">
          <Button
            key="submit"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={printInvoice}
          >
            In hóa đơn
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Bill;
