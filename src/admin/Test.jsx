import { BookOutlined, EditOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Checkbox, ConfigProvider, DatePicker, Form, Image, Input, notification, Select, Skeleton, Table, Tooltip } from "antd";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OrderService } from "./../services/order";
import viVN from "antd/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { paymentServices } from "../services/payments";
dayjs.locale("vi");
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Test = () => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [form] = Form.useForm();
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState({
    email: "",
    address: "",
    fullname: "",
    shipping_fee: "",
    discount_points: "",
    total_amount: "",
    coupon_discount_value: "",
  });
  const { RangePicker } = DatePicker;
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    paymentMethod: null,
  });

  // danh sách đơn hàng
  const [searchKeyword, setSearchKeyword] = useState("");

  const { data: ordersData = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await OrderService.getAllOrder();
      return Array.isArray(response.orders) ? response.orders : [];
    },
  });

  const { data: searchResults = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["searchOrders", searchKeyword],
    queryFn: async () => {
      if (!searchKeyword) return [];
      const response = await OrderService.searchOrders(searchKeyword);
      return Array.isArray(response) ? response : [];
    },
    enabled: searchKeyword.length > 0,  // Chỉ gọi API khi có từ khóa tìm kiếm
  });

  // danh sách phương thức thanh toán
  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentServices.getPayment,
  });

  // danh sách trạng thái
  const { data: statusData } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await OrderService.getAllStatus();
      return response.data;
    },
  });
  const status = statusData ? [...statusData].sort((a, b) => a.id - b.id) : [];

  // lấy ra đơn hàng theo ID
  const { data: orderStatuses = [] } = useQuery({
    queryKey: ["orderStatuses", selectedOrderId], // Dùng selectedOrderId thay vì id từ URL
    queryFn: async () => {
      if (!selectedOrderId) return [];
      const response = await OrderService.getOrderStatus(selectedOrderId);
      return response?.data || [];
    },
    enabled: !!selectedOrderId, // Chỉ gọi API khi có selectedOrderId
  });

  const validTransitions = {
    1: [2], // Chờ thanh toán -> Đã thanh toán
    2: [3, 8], // Đã thanh toán -> Đang xử lý hoặc Hủy đơn
    3: [4, 8], // Đang xử lý -> Đang giao hàng hoặc Hủy đơn
    4: [5, 6], // Đang giao hàng -> Đã giao hàng hoặc Giao hàng thất bại
    6: [4, 8],
  };

  const showEdit = (order) => {
    setSelectedOrderId(order.id); // Lưu ID đơn hàng
    const currentStatusId = order.status?.id; // Lấy trạng thái hiện tại

    form.setFieldsValue({
      status_id: undefined, // Không đặt giá trị mặc định cho status_id
      note: "",
      employee_evidence: "",
    });

    // Lọc các trạng thái hợp lệ dựa trên trạng thái hiện tại
    const validStatuses = validTransitions[currentStatusId] || [];
    const filteredStatus = status.filter(item => validStatuses.includes(item.id));

    setValidStatuses(filteredStatus); // Lưu lại các trạng thái hợp lệ

    setIsModal(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ?? null, // Đảm bảo khi xóa sẽ đặt lại thành null
    }));
  };

  const mergedOrders = (searchKeyword ? searchResults : ordersData).map(order => ({
    ...order,
    payment: payments?.find(p => p.id === order.payment_id),
    status: status?.find(s => s.id === order.status_id),
  }));

  const filteredOrders = (mergedOrders || []).filter((order) => {
    const { dateRange, status, paymentMethod } = filters;

    const isWithinDateRange =
      !dateRange ||
      (dayjs(order.created_at).isSameOrAfter(dayjs(dateRange[0]), "day") &&
        dayjs(order.created_at).isSameOrBefore(dayjs(dateRange[1]), "day"));

    const matchesStatus = status === null || order.status?.id === status;
    const matchesPayment =
      paymentMethod === null || order.payment?.id === paymentMethod;

    return isWithinDateRange && matchesStatus && matchesPayment;
  });

  const dataSource = filteredOrders.map((order, index) => ({
    ...order,
    key: order.id,
    index: index + 1,
  }));

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

    // Cập nhật email và địa chỉ của đơn hàng
    setOrderInfo({
      email: order.email,
      address: order.address,
      fullname: order.fullname,
      discount_points: order.discount_points,
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
      coupon_discount_value: order.coupon_discount_value,
    });

    // Lọc danh sách sản phẩm của đơn hàng từ ordersData
    const orderDetails = await OrderService.getOrderById(order.id);
    setOrderDetails(orderDetails);
  };

  // Đóng modal
  const hideBatchUpdateModal = () => {
    setBatchUpdateModalVisible(false);
  };

  // Xử lý khi người dùng chọn tất cả đơn hàng
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders);  // Chọn tất cả đơn hàng sau khi lọc
    } else {
      setSelectedOrders([]);  // Bỏ chọn tất cả
    }
  };

  // Cập nhật danh sách các đơn hàng được chọn
  const rowSelection = {
    selectedRowKeys: selectedOrders.map(order => order.id),
    onChange: (selectedRowKeys) => {
      setSelectedOrders(filteredOrders.filter(order => selectedRowKeys.includes(order.id)));
    },
  };

  const handleSelectSingle = (order) => {
    setSelectedOrders((prevSelectedOrders) => {
      if (prevSelectedOrders.some(item => item.id === order.id)) {
        return prevSelectedOrders.filter(item => item.id !== order.id);
      } else {
        return [...prevSelectedOrders, order];
      }
    });
  };

  const columns = [
    {
      title: <Checkbox onChange={handleSelectAll} />,
      render: (_, order) => (
        <Checkbox
          checked={selectedOrders.some(item => item.id === order.id)}
          onChange={() => handleSelectSingle(order)}
        />
      ),
    },
    {
      title: "STT",
      dataIndex: "index",
      align: "center",
    },
    {
      title: "Mã đơn hàng",
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
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      align: "center",
    },
    {
      title: "Giá trị đơn hàng (VNĐ)",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      width: 160,
      render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) => created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),  // Sắp xếp theo ngày
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "payment",
      align: "center",
      width: 160,
      render: (payment) => (
        <div className="action-link-blue">{payment?.name}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <div className={status?.id >= 8 ? "action-link-red" : "action-link-blue"}>
          {status?.name}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, item) => (
        <div className="action-container">
          <Tooltip title="Xem thêm">
            <Button
              color="purple"
              variant="solid"
              icon={<EyeOutlined />}
              onClick={() => showModal(item)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật">
            <Button
              color="primary"
              variant="solid"
              icon={<EditOutlined />}
              onClick={() => showEdit(item)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-5">
        <BookOutlined style={{ marginRight: "8px" }} />
        Đơn hàng
      </h1>

      <div className="group1">
        <ConfigProvider locale={viVN}>
          <RangePicker
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            allowClear
          />
        </ConfigProvider>

        <Select
          placeholder="Trạng thái"
          className="select-item"
          value={filters.status}
          onChange={(value) => handleFilterChange("status", value)}
          allowClear
        >
          {status.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Phương thức thanh toán"
          className="select-item"
          value={filters.paymentMethod}
          onChange={(value) => handleFilterChange("paymentMethod", value)}
          allowClear
        >
          {payments?.map((method) => (
            <Select.Option key={method.id} value={method.id}>
              {method.name}
            </Select.Option>
          ))}
        </Select>

        <Input.Search
          style={{ width: '400px' }}
          placeholder="Tìm kiếm đơn hàng..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={(value) => setSearchKeyword(value.trim())}
        />
      </div>

      <Skeleton loading={isLoadingOrders || isLoadingSearch} active>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Skeleton>

    </div>
  );
};

export default Test;