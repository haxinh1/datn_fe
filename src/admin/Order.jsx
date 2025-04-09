import { BookOutlined, EditOutlined, EyeOutlined, MenuOutlined, SearchOutlined, ToTopOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, ConfigProvider, DatePicker, Form, Image, Input, Modal, notification, Row, Select, Skeleton, Table, Tooltip, Upload } from "antd";
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
import TextArea from "antd/es/input/TextArea";
import { saveAs } from 'file-saver';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Order = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const hideEdit = () => setIsModal(false);
  const [form] = Form.useForm();
  const [image, setImage] = useState("");
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
  const [validStatuses, setValidStatuses] = useState([]);
  const [batchUpdateModalVisible, setBatchUpdateModalVisible] = useState(false);
  const [batchUpdateStatuses, setBatchUpdateStatuses] = useState([]);
  const [batchUpdateNote, setBatchUpdateNote] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    status: null,
    paymentMethod: null,
  });
  const [searchInput, setSearchInput] = useState(""); // nhập từ ô input
  const [searchKeyword, setSearchKeyword] = useState("");

  // danh sách đơn hàng
  const { data: ordersData, isLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["orders", searchKeyword],
    queryFn: async () => {
      if (searchKeyword.trim()) {
        return await OrderService.searchOrders(searchKeyword); // ✅ gọi service đã sửa
      }
      const response = await OrderService.getAllOrder();
      return response.orders || [];
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

  const orderStatusesData = (orderStatuses || []).map((item, index) => ({
    key: index,
    index: index + 1,
    status: item.status?.name,
    note: item.note,
    employee_evidence: item.employee_evidence,
    modified_by: item.modified_by?.fullname || 'Khách hàng',
    created_at: dayjs(item.created_at).format("DD/MM/YYYY - HH:mm"),
  }));

  const validTransitions = {
    2: [3, 8], // Đã thanh toán -> Đang xử lý hoặc Hủy đơn
    3: [4, 8], // Đang xử lý -> Đang giao hàng hoặc Hủy đơn
    4: [5, 6], // Đang giao hàng -> Đã giao hàng hoặc Giao hàng thất bại
    6: [4, 8],
    // 5: [7], // Đã giao hàng -> Hoàn thành
    9: [10, 11], // Chờ xử lý trả hàng -> Chấp nhận trả hàng, Từ chối trả hàng
    10: [12], // Chờ xử lý trả hàng -> Đang xử lý trả hàng
    12: [13], // Đang xử lý trả hàng -> Người bán đã nhận hàng
    13: [14],
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

    // Lấy id người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const modifiedBy = user?.id;

    const payload = {
      order_status_id: values.status_id,
      note: values.note || "",
      employee_evidence: values.employee_evidence || image || "",
      user_id: modifiedBy,
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
      [key]: value,  // Cập nhật giá trị của key (status hoặc dateRange)
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: null,
      status: null,
      paymentMethod: null,
    });
  };

  // Tính số lượng đơn hàng cho mỗi trạng thái
  const statusCounts = {
    1: ordersData?.filter(order => order.status?.id === 1).length || 0,
    2: ordersData?.filter(order => order.status?.id === 2).length || 0,
    3: ordersData?.filter(order => order.status?.id === 3).length || 0,
    4: ordersData?.filter(order => order.status?.id === 4).length || 0,
    5: ordersData?.filter(order => order.status?.id === 5).length || 0,
    6: ordersData?.filter(order => order.status?.id === 6).length || 0,
    7: ordersData?.filter(order => order.status?.id === 7).length || 0,
    8: ordersData?.filter(order => order.status?.id === 8).length || 0,
    9: ordersData?.filter(order => order.status?.id === 9).length || 0,
    10: ordersData?.filter(order => order.status?.id === 10).length || 0,
    11: ordersData?.filter(order => order.status?.id === 11).length || 0,
    12: ordersData?.filter(order => order.status?.id === 12).length || 0,
    13: ordersData?.filter(order => order.status?.id === 13).length || 0,
    14: ordersData?.filter(order => order.status?.id === 14).length || 0,
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

  // Hàm hiển thị modal cập nhật trạng thái
  const showBatchUpdateModal = () => {
    if (selectedOrders.length === 0 || !selectedOrders.every(order => order.status.id === selectedOrders[0]?.status.id)) {
      return; // Không mở modal nếu không có đơn hàng được chọn hoặc các đơn hàng không cùng trạng thái
    }

    // Lấy trạng thái hiện tại của các đơn hàng
    const currentStatus = selectedOrders[0]?.status.id;

    // Lọc các trạng thái hợp lệ dựa trên trạng thái hiện tại của các đơn hàng
    const validStatuses = validTransitions[currentStatus] || [];
    const filteredStatus = status.filter(item => validStatuses.includes(item.id));

    // Set các trạng thái hợp lệ vào modal
    setBatchUpdateStatuses(filteredStatus);

    // Mở modal
    setBatchUpdateModalVisible(true);
  };

  // Kiểm tra trạng thái của các đơn hàng đã chọn
  const areAllOrdersSameStatus = selectedOrders.every(
    (order) => order.status.id === selectedOrders[0]?.status.id
  );

  // Nút cập nhật sẽ được kích hoạt khi có ít nhất một đơn hàng được chọn và tất cả đơn hàng có trạng thái giống nhau
  const isUpdateButtonDisabled = selectedOrders.length === 0 || !areAllOrdersSameStatus;


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

  const handleBatchUpdateOrder = async (values) => {
    const payload = {
      order_ids: selectedOrders.map((order) => order.id),  // Lấy ID các đơn hàng đã chọn
      current_status: selectedOrders[0].status.id,  // Trạng thái hiện tại của đơn hàng
      new_status: values.status_id,  // Trạng thái mới
      note: values.note || "",  // Ghi chú đồng bộ cho các đơn hàng
    };

    console.log(payload)

    try {
      // Gọi API cập nhật trạng thái cho nhiều đơn hàng
      const response = await updateOrders(payload);
      notification.success({
        message: "Trạng thái của các đơn hàng đẫ được cập nhật!",
      });
      hideBatchUpdateModal(); // Đóng modal
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

  const getReturnReason = (note) => {
    switch (note) {
      case "store_error":
        return "Cửa hàng gửi sai, thiếu sản phẩm";
      case "damaged":
        return "Sản phẩm có dấu hiệu hư hỏng";
      case "misdescription":
        return "Sản phẩm khác với mô tả";
      case "size_change":
        return "Tôi muốn đổi size";
      case "other":
        return "Khác";
      default:
        return note || "";
    }
  };

  const handleExportExcel = async () => {
    // Nếu không có đơn hàng nào được chọn, xuất toàn bộ dữ liệu
    const selectedOrderIds = selectedOrders.length > 0
      ? selectedOrders.map((order) => order.id)
      : ordersData.map((order) => order.id);  // Nếu không có đơn nào được chọn, lấy tất cả các đơn hàng

    try {
      // Gọi API để lấy dữ liệu xuất Excel
      const response = await fetch('http://127.0.0.1:8000/api/export-orders', {
        method: 'POST',  // Phương thức POST
        headers: {
          'Content-Type': 'application/json', // Đảm bảo API nhận đúng loại dữ liệu
        },
        body: JSON.stringify({ order_ids: selectedOrderIds }),  // Truyền order_ids vào body
      });

      // Kiểm tra nếu API trả về file nhị phân (Excel)
      const blob = await response.blob();

      // Kiểm tra kích thước của file (optional)
      if (blob.size === 0) {
        throw new Error('File xuất ra rỗng');
      }

      // Sử dụng file-saver để lưu tệp Excel về máy người dùng
      saveAs(blob, 'order_item.xlsx');

      notification.success({
        message: 'Xuất Excel thành công!',
        description: 'Dữ liệu đã được xuất và tải xuống thành công.',
      });
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      notification.error({
        message: 'Xuất Excel thất bại!',
        description: error.message || 'Có lỗi xảy ra khi xuất dữ liệu.',
      });
    }
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
      render: (note) => getReturnReason(note),
    },
    {
      title: "Ảnh/video xác nhận",
      dataIndex: "employee_evidence",
      key: "employee_evidence",
      align: "center",
      render: (employee_evidence) => {
        // Kiểm tra nếu là ảnh
        const isImage = employee_evidence && (employee_evidence.endsWith(".jpg") || employee_evidence.endsWith(".jpeg") || employee_evidence.endsWith(".png"));
        // Kiểm tra nếu là video
        const isVideo = employee_evidence && (employee_evidence.endsWith(".mp4") || employee_evidence.endsWith(".webm"));
        if (isImage) {
          // Nếu là ảnh, hiển thị ảnh với Ant Design Image component
          return <Image width={60} src={employee_evidence} alt="Employee Evidence" />;
        } else if (isVideo) {
          // Nếu là video, chỉ hiển thị URL của video
          return <a className="text-url" href={employee_evidence} target="_blank" rel="noopener noreferrer">{employee_evidence}</a>;
        }
        return null; // Nếu không phải ảnh hay video, không hiển thị gì
      }
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
        <BookOutlined style={{ marginRight: "8px" }} />
        Đơn hàng
      </h1>

      <div
        style={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          display: "flex",
          gap: "5px",
          marginBottom: "20px",
        }}
      >
        <Button
          type={filters.status === 1 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 1)}
        >
          Chờ thanh toán ({statusCounts[1]})
        </Button>
        <Button
          type={filters.status === 2 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 2)}
        >
          Đã thanh toán ({statusCounts[2]})
        </Button>
        <Button
          type={filters.status === 3 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 3)}
        >
          Đang xử lý ({statusCounts[3]})
        </Button>
        <Button
          type={filters.status === 4 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 4)}
        >
          Đang giao hàng ({statusCounts[4]})
        </Button>
        <Button
          type={filters.status === 5 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 5)}
        >
          Đã giao hàng ({statusCounts[5]})
        </Button>
        <Button
          type={filters.status === 6 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 6)}
        >
          Giao hàng thất bại ({statusCounts[6]})
        </Button>
        <Button
          type={filters.status === 7 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 7)}
        >
          Hoàn thành ({statusCounts[7]})
        </Button>
        <Button
          type={filters.status === 8 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 8)}
        >
          Hủy đơn ({statusCounts[8]})
        </Button>
        <Button
          type={filters.status === 9 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 9)}
        >
          Trả hàng ({statusCounts[9]})
        </Button>
        <Button
          type={filters.status === 10 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 10)}
        >
          Châp nhận trả hàng ({statusCounts[10]})
        </Button>
        <Button
          type={filters.status === 11 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 11)}
        >
          Từ chối trả hàng ({statusCounts[11]})
        </Button>
        <Button
          type={filters.status === 12 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 12)}
        >
          Đã hoàn tiền ({statusCounts[12]})
        </Button>
        <Button
          type={filters.status === 13 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 13)}
        >
          Đang trả hàng về shop ({statusCounts[13]})
        </Button>
        <Button
          type={filters.status === 14 ? "primary" : "default"}
          onClick={() => handleFilterChange("status", 14)}
        >
          Shop đã nhận hàng ({statusCounts[14]})
        </Button>
      </div>

      <div className="group1">
        <Button
          onClick={resetFilters}
          icon={<MenuOutlined />}
        />

        <ConfigProvider locale={viVN}>
          <RangePicker
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange("dateRange", dates)}
            allowClear
          />
        </ConfigProvider>

        {/* <Select
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
        </Select> */}

        <Select
          placeholder="Phương thức thanh toán"
          className="select-item"
          value={filters.paymentMethod}
          onChange={(value) => handleFilterChange("paymentMethod", value)}
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
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);

            if (!value) {
              setSearchKeyword("");
            }
          }}
          onSearch={() => setSearchKeyword(searchInput)}
        />

        <div className="group2">
          <Button
            color="primary" variant="solid"
            icon={<ToTopOutlined />}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>

          <Button
            color="primary"
            variant="solid"
            icon={<EditOutlined />}
            onClick={showBatchUpdateModal}
            disabled={isUpdateButtonDisabled}
          >
            Cập nhật
          </Button>
        </div>
      </div>

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
        width={1000}
      >
        <span>Khách hàng: <span className="text-quest">{orderInfo.fullname}</span></span> <br />
        <span>Email: <span className="text-quest">{orderInfo.email}</span></span> <br />
        <span>Địa chỉ giao hàng: <span className="text-quest">{orderInfo.address}</span></span>

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

                {/* <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    Phiếu giảm giá:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    {formatPrice(orderInfo.coupon_discount_value)}
                  </Table.Summary.Cell>
                </Table.Summary.Row> */}

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

        <hr />
        <h1 className="mb-5">Lịch sử cập nhật</h1>
        <Table
          columns={editcolumns}
          dataSource={orderStatusesData}
          pagination={{ pageSize: 5 }}
          bordered
        />
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
              <Form.Item
                label="Trạng thái đơn hàng"
                name="status_id"
                rules={[{ required: true, message: "Vui lòng cập nhật trạng thái" }]}
              >
                <Select
                  className="input-item"
                  placeholder="Chọn trạng thái"
                  showSearch
                >
                  {validStatuses.map((item) => (
                    <Select.Option key={item.id} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <TextArea className="input-item" />
              </Form.Item>
            </Col>

            <Col span={12} className="col-item">
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
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </button>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <div className="add">
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Cập nhật trạng thái nhiều đơn hàng"
        visible={batchUpdateModalVisible}
        onCancel={hideBatchUpdateModal}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleBatchUpdateOrder}>
          <Form.Item
            label="Trạng thái đơn hàng"
            name="status_id"
            rules={[{ required: true, message: "Vui lòng cập nhật trạng thái" }]}
          >
            <Select
              className="input-item"
              placeholder="Chọn trạng thái"
              showSearch
            >
              {batchUpdateStatuses.map((status) => (
                <Select.Option key={status.id} value={status.id}>
                  {status.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              className="input-item"
              value={batchUpdateNote}
              onChange={(e) => setBatchUpdateNote(e.target.value)}
            />
          </Form.Item>

          <div className="add">
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Order;