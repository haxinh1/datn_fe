import {
  BookOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Image,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Skeleton,
  Table,
  Tooltip,
  Upload,
} from "antd";
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { OrderService } from "./../services/order";
import dayjs from "dayjs";

const Order = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const hideEdit = () => setIsModal(false);
  const [form] = Form.useForm();
  const [image, setImage] = useState("");
  const [orderDetails, setOrderDetails] = useState([]);

  const {
    data: ordersData,
    isLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await OrderService.getAllOrder();
      return response.orders || { data: [] };
    },
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
    form.setFieldsValue({
      status_id: order.status?.id,
      note: "",
      employee_evidence: "",
    });
    setIsModal(true);
  };

  const orders = ordersData || { data: [] };

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

  // Chuyển đổi dữ liệu thành dataSource cho bảng
  const dataSource = Array.isArray(orders)
    ? orders.map((order, index) => ({
        ...order,
        key: order.id,
        index: index + 1,
      }))
    : [];

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
    }
  };

  const showModal = (order) => {
    setIsModalVisible(true);
    setSelectedOrderId(order.id);

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

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Skeleton>

      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
      >
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
      </Modal>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={isModal}
        onCancel={hideEdit}
        footer={null}
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateOrder}>
          <Row gutter={24}>
            <Col span={8} className="col-item">
              <Form.Item label="Trạng thái đơn hàng" name="status_id">
                <Select
                  className="input-item"
                  placeholder="Trạng thái"
                  showSearch
                  value={form.getFieldValue("status_id")}
                  onChange={(value) =>
                    form.setFieldsValue({ status_id: value })
                  }
                >
                  {status.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input className="input-item" />
              </Form.Item>
            </Col>

            <Col span={8} className="col-item">
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
                  <button className="upload-button" type="button">
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Button htmlType="submit" type="primary" className="btn-item">
            Cập nhật
          </Button>
        </Form>

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
    </div>
  );
};

export default Order;
