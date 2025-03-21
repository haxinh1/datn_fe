import { EyeOutlined, PrinterOutlined, ToTopOutlined } from '@ant-design/icons'
import { Button, Checkbox, DatePicker, Modal, Select, Skeleton, Table, Tooltip } from 'antd';
import React, { useState } from 'react'
import { OrderService } from '../services/order';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { paymentServices } from '../services/payments';
import viVN from "antd/es/locale/vi_VN";
import { ConfigProvider } from 'antd';

const Bill = () => {
  const { RangePicker } = DatePicker;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState({ email: "", address: "" });

  // danh sách hóa đơn
  const { data: bills, isLoading } = useQuery({
    queryKey: ["complete"],
    queryFn: async () => {
      const response = await OrderService.getAllBill();
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

  // danh sách phương thức thanh toán
  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentServices.getPayment,
  });

  // Tách số thành định dạng tiền tệ
  const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  };

  const columns = [
    {
      title: <Checkbox />,
      render: (_, order) => (
        <Checkbox />
      ),
    },
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Tên người đặt",
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
      render: (created_at) =>
        created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payment",
      align: "center",
      render: (payment) => (
        <div className="action-link-blue">{payment?.name}</div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, item) => (
        <div className="action-container">
          <Tooltip title="Xem hóa đơn">
            <Button
              color="purple"
              variant="solid"
              icon={<EyeOutlined />}
              onClick={() => showModal(item)}
            />
          </Tooltip>
          <Tooltip title="Xuất hóa đơn">
            <Button
              color="primary"
              variant="solid"
              icon={<ToTopOutlined />}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      align: "center",
      render: (text, record) => {
        // Kiểm tra nếu product có dữ liệu và lấy tên sản phẩm từ record.product.name
        const productName = record.name ? record.name : '';
        // Kiểm tra nếu variants có thuộc tính và kết hợp tên sản phẩm với thuộc tính biến thể
        const variantAttributes = record.variants.map(variant => {
          // Lấy các thuộc tính của biến thể và nối chúng lại
          const attributes = variant.attributes.map(attr => attr.attribute_name).join(" - ");
          return `${productName} - ${attributes}`;  // Kết hợp tên sản phẩm với thuộc tính biến thể
        }).join(", ");

        return variantAttributes || productName;  // Nếu không có biến thể, chỉ trả về tên sản phẩm
      }
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
      title: "Tổng tiền (VNĐ)", // ✅ Thêm cột tổng tiền
      dataIndex: "total",
      align: "center",
      render: (_, record) => formatPrice(record.quantity * record.sell_price),
    },
  ];

  return (
    <div>
      <h1 className="mb-5">
        <PrinterOutlined style={{ marginRight: "8px" }} />
        Quản lý hóa đơn
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

        <Select
          placeholder="Phương thức thanh toán"
          className="select-item"
          onChange={(value) => handleFilterChange("payment", value)}
          allowClear
        >
          {payments?.map((method) => (
            <Select.Option key={method.id} value={method.id}>
              {method.name}
            </Select.Option>
          ))}
        </Select>

        <div className="group2">
          <Button
            color="primary"
            variant="solid"
            icon={<ToTopOutlined />}
          >
            Xuất hóa đơn
          </Button>
        </div>
      </div>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Skeleton>

      <Modal
        title="Chi tiết hóa đơn"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
      >
        <span>Email người đặt: <span className="text-quest">{orderInfo.email}</span></span> <br />
        <span>Địa chỉ nhận hàng: <span className="text-quest">{orderInfo.address}</span></span>

        <Table
          columns={detailColumns}
          dataSource={orderDetails.map((item, index) => ({
            ...item,
            key: index,
            index: index + 1,
            product_name: item.product?.name,
          }))}
          bordered
          pagination={false}
          summary={() => {
            const totalAmount = orderDetails.reduce(
              (sum, item) => sum + item.quantity * item.sell_price,
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={4} align="right">
                  <strong>Tổng giá trị (VNĐ):</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center">
                  <strong>{formatPrice(totalAmount)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Modal>
    </div>
  )
}

export default Bill