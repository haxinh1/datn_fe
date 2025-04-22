import {
  BookOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  Tooltip,
  Modal,
  Form,
  Select,
  notification,
  Skeleton,
  Row,
  Col,
  Input,
  DatePicker,
  Switch,
  Descriptions,
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { CouponServices } from "../services/coupon";
import formatDate from "../utils/formatDate";
import { AuthServices } from "../services/auth";

const Coupon = () => {
  const [coupon, setCoupon] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const couponType = Form.useWatch("coupon_type", form);
  const hasNotifiedExpiredRef = useRef(false); // Sử dụng useRef để tránh re-render không cần thiết
  const hasNotifiedUsageLimitRef = useRef(false);
  const hasNotifiedFetchErrorRef = useRef(false); // Trạng thái để theo dõi lỗi fetchCoupons

  const showDetailModal = async (id) => {
    try {
      const response = await CouponServices.getCounponById(id);
      if (response.success && response.data) {
        setSelectedCoupon([response.data]);
      }
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error("Error fetching coupon details:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải chi tiết mã giảm giá.",
      });
    }
  };

  const handleShowModal = async (coupon) => {
    setEditingCoupon(coupon);
    if (coupon) {
      form.setFieldsValue({
        title: coupon.title,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        usage_limit: coupon.usage_limit,
        start_date: dayjs(coupon.start_date),
        end_date: dayjs(coupon.end_date),
        is_active: coupon.is_active,
        coupon_type: coupon.coupon_type,
        rank: coupon.rank || undefined,
        user_ids: coupon.users
          ? coupon.users.map((user) => user.id)
          : undefined,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleDetailCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedCoupon(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const detailColumn = [
    {
      title: "STT",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Loại phiếu giảm giá",
      dataIndex: "discount_type",
      key: "discount_type",
      align: "center",
    },
    {
      title: "Loại Áp Dụng",
      dataIndex: "coupon_type",
      key: "coupon_type",
      align: "center",
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discount_value",
      key: "discount_value",
      align: "center",
    },
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "Người dùng",
      dataIndex: "users",
      key: "users",
      render: (users, record) => {
        if (record.coupon_type === "private" && Array.isArray(users)) {
          return users.map((user) => user.email).join(", ");
        }
        return "N/A";
      },
    },
  ];

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      align: "center",
    },
    {
      title: "Tên mã",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Loại phiếu giảm giá",
      dataIndex: "discount_type",
      key: "discount_type",
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "usage_limit",
      key: "quantity",
      align: "center",
    },
    {
      title: "Giá trị giảm",
      dataIndex: "discount_value",
      key: "discount_value",
      align: "center",
      render: (value, record) => (
        <span>
          {value} {record.discount_type === "percent" ? "%" : "đ"}
        </span>
      ),
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "start_date",
      key: "start_date",
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      render: (isActive, record) => {
        if (record.is_expired) {
          return <span className="action-link-red">Dừng áp dụng</span>;
        }
        return (
          <span className={isActive ? "action-link-blue" : "action-link-red"}>
            {isActive ? "Đang áp dụng" : "Dừng áp dụng"}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="action-container">
          <Tooltip title="Xem thêm">
            <Button
              color="purple"
              variant="solid"
              icon={<EyeOutlined />}
              type="link"
              onClick={() => showDetailModal(record.id)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật">
            <Button
              color="primary"
              variant="solid"
              icon={<EditOutlined />}
              type="link"
              onClick={() => handleShowModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      code: values.code,
      description: values.description,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      usage_limit: values.usage_limit,
      start_date: values.start_date,
      end_date: values.end_date,
      is_active: values.is_active,
      coupon_type: values.coupon_type,
    };

    if (values.coupon_type === "private") {
      payload.user_ids = values.user_ids || [];
    } else if (values.coupon_type === "rank") {
      payload.rank = values.rank || null;
    }

    let response;
    try {
      if (editingCoupon) {
        response = await CouponServices.updateCoupon(editingCoupon.id, payload);
      } else {
        response = await CouponServices.createCoupon(payload);
      }
      if (response) {
        await fetchCoupons();
        notification.success({
          message: editingCoupon
            ? "Cập nhật mã giảm giá thành công!"
            : "Tạo mã giảm giá thành công!",
        });
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving coupon:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu mã giảm giá.",
      });
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await CouponServices.fetchCoupons();
      setCoupon(data);
      setIsLoading(false);
      hasNotifiedFetchErrorRef.current = false; // Reset trạng thái lỗi khi fetch thành công
    } catch (error) {
      console.error("Error fetching coupons:", error);
      if (!hasNotifiedFetchErrorRef.current) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách mã giảm giá.",
        });
        hasNotifiedFetchErrorRef.current = true; // Đánh dấu đã thông báo lỗi
      }
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await AuthServices.fetchAuth();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Function to check and update expired coupons
  const checkAndUpdateExpiredCoupons = async () => {
    const now = dayjs();
    const couponsToUpdate = coupon.filter(
      (c) =>
        c.is_active &&
        c.end_date &&
        dayjs(c.end_date).isBefore(now, "day") &&
        !c.is_expired
    );

    if (couponsToUpdate.length === 0) return;

    try {
      for (const c of couponsToUpdate) {
        const payload = {
          ...c,
          is_active: false,
        };
        await CouponServices.updateCoupon(c.id, payload);
      }
      await fetchCoupons(); // Refresh the coupon list
      if (!hasNotifiedExpiredRef.current) {
        notification.info({
          message: "Cập nhật trạng thái",
          description: `${couponsToUpdate.length} mã giảm giá đã được chuyển sang trạng thái dừng áp dụng do hết hạn.`,
        });
        hasNotifiedExpiredRef.current = true; // Đánh dấu đã thông báo
      }
    } catch (error) {
      console.error("Error updating expired coupons:", error);
      if (!hasNotifiedExpiredRef.current) {
        notification.error({
          message: "Lỗi",
          description: "Không thể cập nhật trạng thái mã giảm giá hết hạn.",
        });
        hasNotifiedExpiredRef.current = true; // Đánh dấu đã thông báo để tránh lặp lại
      }
    }
  };

  // Function to check and update coupons with usage_limit = 0
  const checkAndUpdateUsageLimitCoupons = async () => {
    const couponsToUpdate = coupon.filter(
      (c) => c.is_active && c.usage_limit === 0
    );

    if (couponsToUpdate.length === 0) return;

    try {
      for (const c of couponsToUpdate) {
        const payload = {
          ...c,
          is_active: false,
        };
        await CouponServices.updateCoupon(c.id, payload);
      }
      await fetchCoupons(); // Refresh the coupon list
      if (!hasNotifiedUsageLimitRef.current) {
        notification.info({
          message: "Cập nhật trạng thái",
          description: `${couponsToUpdate.length} mã giảm giá đã được chuyển sang trạng thái dừng áp dụng do số lượng bằng 0.`,
        });
        hasNotifiedUsageLimitRef.current = true; // Đánh dấu đã thông báo
      }
    } catch (error) {
      console.error("Error updating usage limit coupons:", error);
      if (!hasNotifiedUsageLimitRef.current) {
        notification.error({
          message: "Lỗi",
          description: "Không thể cập nhật trạng thái mã giảm giá do số lượng bằng 0.",
        });
        hasNotifiedUsageLimitRef.current = true; // Đánh dấu đã thông báo để tránh lặp lại
      }
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchUsers();
  }, []);

  // Periodic check for expired coupons and usage limit
  useEffect(() => {
    // Initial check when component mounts
    const performChecks = async () => {
      await checkAndUpdateExpiredCoupons();
      await checkAndUpdateUsageLimitCoupons();
    };
    performChecks();

    // Set interval to check every minute (60000ms)
    const interval = setInterval(async () => {
      await checkAndUpdateExpiredCoupons();
      await checkAndUpdateUsageLimitCoupons();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Không phụ thuộc vào coupon để tránh re-render không cần thiết

  return (
    <div>
      <h1 className="mb-5">
        <ProjectOutlined style={{ marginRight: "8px" }} />
        Mã giảm giá
      </h1>
      <div className="btn-brand">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleShowModal()}
        >
          Thêm mới
        </Button>
      </div>

      <Skeleton active loading={isLoading}>
        <Table
          dataSource={coupon}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Skeleton>

      {/* Modal Chi Tiết */}
      <Modal
        title="Chi tiết mã giảm giá"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        footer={null}
        width={800}
      >
        <Table
          dataSource={selectedCoupon}
          rowKey={"id"}
          columns={detailColumn}
          pagination={false}
        />
      </Modal>

      <Modal
        title={editingCoupon ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item label="Tên mã giảm giá" name="title">
                <Input className="input-item" />
              </Form.Item>
            </Col>
            <Col span={12} className="col-item">
              <Form.Item
                label="Mã giảm giá"
                name="code"
                rules={[{ required: true, message: "Vui lòng chọn Code" }]}
              >
                <Input className="input-item" disabled={!!editingCoupon} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả" name="description">
            <TextArea className="input-item" />
          </Form.Item>
          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item
                label="Kiểu giảm giá"
                name="discount_type"
                rules={[
                  { required: true, message: "Vui lòng chọn kiểu giảm giá" },
                ]}
              >
                <Select placeholder="Chọn kiểu giảm giá" className="input-item">
                  <Option value="percent">%</Option>
                  <Option value="fix_amount">VND</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} className="col-item">
              <Form.Item
                label="Giá trị giảm giá"
                name="discount_value"
                dependencies={["discount_type"]}
                rules={[
                  { required: true, message: "Vui lòng chọn giá trị giảm giá" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const discountType = getFieldValue("discount_type");
                      if (discountType === "percent") {
                        if (value < 1 || value > 100) {
                          return Promise.reject("Giá trị phải từ 1 - 100%");
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input className="input-item" type="number" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item
                label="Loại phiếu"
                name="coupon_type"
                rules={[{ required: true, message: "Chọn loại" }]}
              >
                <Select placeholder="Chọn loại" className="input-item">
                  <Option value="public">Công khai</Option>
                  <Option value="private">Riêng tư</Option>
                  <Option value="rank">Theo hạng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12} className="col-item">
              <Form.Item
                label="Số lần áp dụng"
                name="usage_limit"
                rules={[
                  { required: true, message: "Vui lòng chọn số lần áp dụng" },
                ]}
              >
                <Input className="input-item" type="number" min={0} />
              </Form.Item>
            </Col>
          </Row>
          {couponType === "rank" && (
            <Form.Item
              label="Hạng thành viên"
              name="rank"
              rules={[{ required: true, message: "Chọn hạng" }]}
            >
              <Select>
                <Option value="bronze">Bronze</Option>
                <Option value="silver">Silver</Option>
                <Option value="gold">Gold</Option>
                <Option value="diamond">Diamond</Option>
              </Select>
            </Form.Item>
          )}
          {couponType === "private" && (
            <Form.Item
              label="Chọn người dùng"
              name="user_ids"
              rules={[{ required: true, message: "Chọn người dùng" }]}
            >
              <Select placeholder="Chọn người dùng" mode="multiple">
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.fullname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Row gutter={24}>
            <Col span={12} className="col-item">
              <Form.Item
                label="Ngày bắt đầu"
                name="start_date"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày áp dụng",
                  },
                ]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  className="input-item"
                  disabledDate={(current) =>
                    current && current.isBefore(dayjs(), "day")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12} className="col-item">
              <Form.Item
                label="Ngày kết thúc"
                name="end_date"
                dependencies={["start_date"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày kết thúc",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue("start_date");
                      if (!value || !startDate) return Promise.resolve();
                      if (value.isBefore(startDate, "day")) {
                        return Promise.reject(
                          "Ngày kết thúc không thể trước ngày bắt đầu!"
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="input-item"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("start_date");
                    return (
                      current && startDate && current.isBefore(startDate, "day")
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Trạng thái"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          <div className="add">
            <Button type="primary" htmlType="submit">
              {editingCoupon ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Coupon;