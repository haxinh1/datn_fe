import { BookOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, ConfigProvider, DatePicker, Form, Image, Input, Modal, notification, Row, Select, Skeleton, Table, Tooltip, Upload } from "antd";
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

const Order = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isModals, setIsModals] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const hideEdit = () => setIsModal(false);
  const hideEdits = () => setIsModals(false);
  const [form] = Form.useForm();
  const [image, setImage] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderInfo, setOrderInfo] = useState({ email: "", address: "" });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const { RangePicker } = DatePicker;
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    paymentMethod: null,
  });

  // danh sách đơn hàng
  const {data: ordersData, isLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await OrderService.getAllOrder();
      return response.orders || { data: [] };
    },
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

  const handleSelectOrder = (selectedRowKeys, selectedRows) => {
    setSelectedOrders(selectedRows); // Lưu trữ các đơn hàng đã chọn
  };  

  const rowSelection = {
    selectedRowKeys: selectedOrders.map((order) => order.id),
    onChange: handleSelectOrder,
  };

  // Hàm xử lý khi bấm nút Cập nhật cho nhiều đơn hàng
  const handleUpdateButtonClick = () => {
    if (selectedOrders.length === 0) {
      notification.error({ message: "Vui lòng chọn ít nhất một đơn hàng!" });
      return;
    }

    // Kiểm tra xem tất cả các đơn hàng đã chọn có trạng thái giống nhau không
    const isSameStatus = selectedOrders.every(
      (order) => order.status.id === selectedOrders[0].status.id
    );

    if (!isSameStatus) {
      notification.error({ message: "Các đơn hàng phải có cùng trạng thái!" });
      return;
    }

    // Nếu các đơn hàng có cùng trạng thái, mở modal
    setIsModals(true); // Hiển thị modal cho việc cập nhật nhiều đơn hàng
  };

  // Hàm gửi yêu cầu cập nhật trạng thái cho nhiều đơn hàng
  const handleBatchUpdate = async (values) => {
    // Kiểm tra nếu chưa chọn đơn hàng
    if (selectedOrders.length === 0) {
      notification.error({ message: "Vui lòng chọn ít nhất một đơn hàng!" });
      return;
    }

    // Tạo payload với danh sách các ID đơn hàng và trạng thái mới
    const payload = {
      order_ids: selectedOrders.map((order) => order.id),  
      current_status: selectedOrders[0].status.id,        
      new_status: values.status_id,     
      note: values.note || "",             
    };

    console.log("Payload gửi đi: ", payload); // Debug

    try {
      // Gọi API cập nhật trạng thái cho nhiều đơn hàng
      const response = await updateOrders(payload);
      notification.success({
        message: "Cập nhật trạng thái cho nhiều đơn hàng thành công!",
      });
      hideEdits(); // Đóng modal
      refetchOrders(); // Làm mới danh sách đơn hàng sau khi cập nhật
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái cho nhiều đơn hàng: ", error);
      notification.error({
        message: "Lỗi cập nhật trạng thái cho nhiều đơn hàng",
      });
    }
  };

  // Hàm gọi API để cập nhật trạng thái cho nhiều đơn hàng
  const updateOrders = async (payload) => {
    const response = await OrderService.updateOrders(payload);
    return response.data;
  };

  const orderStatusesData = (orderStatuses || []).map((item, index) => ({
    key: index,
    index: index + 1,
    status: item.status?.name,
    note: item.note,
    employee_evidence: item.employee_evidence,
    modified_by: item.modified_by?.fullname,
    created_at: dayjs(item.created_at).format("DD/MM/YYYY - HH:mm"),
  }));

  const showEdit = (order) => {
    setSelectedOrderId(order.id); // Lưu ID đơn hàng
    const currentStatusId = order.status?.id; // Lấy trạng thái hiện tại

    form.setFieldsValue({
      status_id: currentStatusId,
      note: "",
      employee_evidence: "",
    });

    setIsModal(true);
  };

  const { mutate: updateOrderStatus } = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await OrderService.updateOrderStatus(id, data);
      return response.data;
    },
    onSuccess: () => {
      notification.success({
        message: "Cập nhật trạng thái đơn hàng thành công!",
      });
    },
    onError: (error) => {
      console.error("Lỗi cập nhật:", error);
      notification.error({
        message: "Lỗi cập nhật",
      });
    },
  });

  // ✅ Hàm cập nhật trạng thái đơn hàng
  const handleUpdateOrder = async (values) => {
    if (!selectedOrderId) {
      notification.error({ message: "Không tìm thấy đơn hàng để cập nhật!" });
      return;
    }

    const payload = {
      order_status_id: values.status_id,
      note: values.note || "",
      employee_evidence: values.employee_evidence || image || "",
    };

    console.log("Dữ liệu gửi đi:", payload); // Debug
    updateOrderStatus(
      { id: selectedOrderId, data: payload },
      {
        onSuccess: () => {
          hideEdit(); // Đóng modal sau khi cập nhật
          form.resetFields(); // Reset form về trạng thái ban đầu
          setSelectedOrderId(null); // Xóa ID đã chọn
          refetchOrders();
        },
      }
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ?? null, // Đảm bảo khi xóa sẽ đặt lại thành null
    }));
  };

  const filteredOrders = (ordersData || []).filter((order) => {
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

  const onHandleChange = (info) => {
    if (info.file.status === "done" && info.file.response) {
      const imageUrl = info.file.response.secure_url;
      setImage(imageUrl);
      form.setFieldsValue({ employee_evidence: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
    } else if (info.file.status === "removed") {
      setImage(""); // Xóa ảnh khi người dùng xóa
      form.setFieldsValue({ employee_evidence: "" }); // Cập nhật lại giá trị trong form
    }
  };

  const showModal = (order) => {
    setIsModalVisible(true);
    setSelectedOrderId(order.id);

    // Cập nhật email và địa chỉ của đơn hàng
    setOrderInfo({
      email: order.email,
      address: order.address,
    });

    // Lọc danh sách sản phẩm của đơn hàng từ ordersData
    const orderDetails = order.order_items || [];
    setOrderDetails(orderDetails);
  };

  const columns = [
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
      title: "Tên người đặt",
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
      render: (total_amount) => (total_amount ? formatPrice(total_amount) : ""),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (created_at) =>
        created_at ? dayjs(created_at).format("DD-MM-YYYY") : "",
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
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <div className="action-link-blue">{status?.name}</div>
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

  const editcolumns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => <div className="action-link-blue">{status}</div>,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      align: "center",
    },
    {
      title: "Ảnh xác nhận",
      dataIndex: "employee_evidence",
      key: "employee_evidence",
      align: "center",
      render: (employee_evidence) =>
        employee_evidence ? (
          <Image width={60} height={90} src={employee_evidence} />
        ) : null,
    },
    {
      title: "Người cập nhật",
      dataIndex: "modified_by",
      key: "modified_by",
      align: "center",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
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
      dataIndex: "product_name",
      align: "center",
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
        <BookOutlined style={{ marginRight: "8px" }} />
        Quản lý đơn hàng
      </h1>

      <div className="group1">
        <ConfigProvider locale={viVN}>
          <RangePicker
            format="DD-MM-YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ marginRight: 10 }}
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

        <div className="group2">
          <Button 
            color="primary" 
            variant="solid"
            icon={<EditOutlined />} 
            onClick={handleUpdateButtonClick}
            disabled={selectedOrders.length === 0 || !selectedOrders.every(order => order.status.id === selectedOrders[0].status.id)}
          >
            Cập nhật
          </Button>
        </div>
      </div>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Skeleton>

      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        width={1000}
      >
        <span>Email người đặt: {orderInfo.email}</span> <br />
        <span>Địa chỉ nhận hàng: {orderInfo.address}</span>
        <Table
          columns={detailColumns}
          dataSource={orderDetails.map((item, index) => ({
            ...item,
            key: index,
            index: index + 1,
            product_name: item.product?.name,
          }))}
          bordered
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

        <hr />
        <h1 className="mb-5">Lịch sử cập nhật</h1>
        <Skeleton active loading={isLoading}>
          <Table
            columns={editcolumns}
            dataSource={orderStatusesData}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </Skeleton>
      </Modal>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={isModal}
        onCancel={hideEdit}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateOrder}>
          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item label="Trạng thái đơn hàng" name="status_id">
                <Select
                  className="input-item"
                  placeholder="Chọn trạng thái"
                  showSearch
                  value={
                    status.find((s) => s.id === form.getFieldValue("status_id"))
                      ?.id || null
                  } // ✅ Hiển thị ID nhưng đảm bảo nó đúng với tên trạng thái
                  onChange={(value) =>
                    form.setFieldsValue({ status_id: value })
                  }
                >
                  {status
                    .filter((item) => {
                      const currentStatusId =
                        form.getFieldValue("status_id") || 0; // ✅ Kiểm tra tránh undefined
                      return item.id >= currentStatusId; // ✅ Hiển thị trạng thái hiện tại và các trạng thái sau
                    })
                    .map((item) => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}{" "}
                        {/* ✅ Hiển thị tên trạng thái thay vì ID */}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ảnh xác nhận"
                name="employee_evidence"
                getValueFromEvent={(e) => e?.file?.response?.secure_url || ""}
              >
                <Upload
                  listType="picture-card"
                  action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                  data={{ upload_preset: "quangOsuy" }}
                  onChange={onHandleChange}
                >
                  {!image && ( 
                    <button className="upload-button" type="button">
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </button>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12} className="col-item">
              <Form.Item label="Ghi chú" name="note">
                <Input className="input-item" />
              </Form.Item>
            </Col>
          </Row>
          
          <div className="add">
            <Button htmlType="submit" type="primary">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật trạng thái nhiều đơn hàng"
        visible={isModals}
        onCancel={hideEdits}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleBatchUpdate}>
          <Form.Item label="Trạng thái đơn hàng" name="status_id">
            <Select
              className="input-item"
              placeholder="Chọn trạng thái"
              showSearch
              value={
                status.find((s) => s.id === form.getFieldValue("status_id"))
                  ?.id || null
              } // ✅ Hiển thị ID nhưng đảm bảo nó đúng với tên trạng thái
              onChange={(value) =>
                form.setFieldsValue({ status_id: value })
              }
            >
              {status
                .filter((item) => {
                  const currentStatusId =
                    form.getFieldValue("status_id") || 0; // ✅ Kiểm tra tránh undefined
                  return item.id >= currentStatusId; // ✅ Hiển thị trạng thái hiện tại và các trạng thái sau
                })
                .map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}{" "}
                    {/* ✅ Hiển thị tên trạng thái thay vì ID */}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
            
          <Form.Item label="Ghi chú" name="note">
            <Input className="input-item" />
          </Form.Item>
          
          <div className="add">
            <Button htmlType="submit" type="primary">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Order;
