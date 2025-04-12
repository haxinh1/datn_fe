import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  theme,
  Modal,
  Avatar,
  Button,
  Tooltip,
  Dropdown,
} from "antd";
import {
  HomeOutlined,
  BookOutlined,
  MessageOutlined,
  LogoutOutlined,
  ProductOutlined,
  ImportOutlined,
  PrinterOutlined,
  GroupOutlined,
  TableOutlined,
  ProjectOutlined,
  EditOutlined,
  SettingOutlined,
  LockOutlined,
  BellOutlined,
  TeamOutlined,
  CommentOutlined,
  RollbackOutlined,
  EyeOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import "./layoutAdmin.css";
import { AuthServices } from "../services/auth";
import logo from "../assets/images/logo-footer.png";

const { Content, Header, Footer, Sider } = Layout;

const LayoutAdmin = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const storedUserId = JSON.parse(localStorage.getItem("user"))?.id; // Lấy chỉ id người dùng từ localStorage
    if (storedUserId) {
      // Gọi service để lấy thông tin người dùng theo id
      const fetchUserInfo = async () => {
        try {
          const userInfo = await AuthServices.getAUser(storedUserId); // Gọi API để lấy thông tin người dùng
          setUser(userInfo); // Lưu thông tin người dùng vào state
        } catch (error) {
          console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
      };
      fetchUserInfo();
    }
  }, []);

  const logoutad = async () => {
    // Hiển thị Modal xác nhận trước khi logout
    Modal.confirm({
      title: "Bạn chắc chắn muốn đăng xuất?",
      content: "Nếu bạn đăng xuất, bạn sẽ phải đăng nhập lại để tiếp tục sử dụng ứng dụng.",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const tokenBefore = localStorage.getItem("adminToken");
          console.log("Token before logout:", tokenBefore); // Kiểm tra token trước khi logout
          localStorage.removeItem("admin_token"); // Xóa token

          // Gửi yêu cầu logout cho admin
          await AuthServices.logoutad(
            "/admin/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${tokenBefore}`,
              },
            }
          );

          // Xóa token admin và user khỏi localStorage
          localStorage.removeItem("adminToken");
          localStorage.removeItem("user"); // Xóa token "user"
          console.log(
            "Token after logout:",
            localStorage.getItem("adminToken")
          );
        } catch (error) {
          console.error("Lỗi khi logout:", error);
        } finally {
          nav("/loginad");
        }
      },
    });
  };

  // Kiểm tra vai trò của người dùng trong localStorage
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";

  const menu = (
    <Menu>
      <Menu.Item key="updateAccount" icon={<EditOutlined />}>
        <Link to={`/admin/update/${user?.id}`}>
          <span>Cập nhật thông tin</span>
        </Link>
      </Menu.Item>
      <Menu.Item key="changePassword" icon={<LockOutlined />}>
        <Link to={`/admin/change/${user?.id}`}>
          <span>Đổi mật khẩu</span>
        </Link>
      </Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: "list-pr",
      icon: <ProductOutlined />,
      label: (
        <Link to="/admin/list-pr">
          <span>Sản phẩm</span>
        </Link>
      ),
    },
    {
      key: "history",
      icon: <ImportOutlined />,
      label: (
        <Link to="/admin/history">
          <span>Nhập hàng</span>
        </Link>
      ),
    },
    !isManager && {
      key: "order",
      icon: <BookOutlined />,
      label: (
        <Link to="/admin/order">
          <span>Đơn hàng</span>
        </Link>
      ),
    },
    !isAdmin && {
      key: "orderstaff",
      icon: <BookOutlined />,
      label: (
        <Link to="/admin/orderstaff">
          <span>Đơn hàng</span>
        </Link>
      ),
    },
    {
      key: "back",
      icon: <RollbackOutlined />,
      label: (
        <Link to="/admin/back">
          <span>Hoàn trả</span>
        </Link>
      ),
    },
    {
      key: "bill",
      icon: <PrinterOutlined />,
      label: (
        <Link to="/admin/bill">
          <span>Hóa đơn</span>
        </Link>
      ),
    },
    !isManager && {
      // Ẩn mục 'Nhân sự' nếu là manager
      key: "account",
      icon: <TeamOutlined />,
      label: (
        <Link to="/admin/account">
          <span>Nhân sự</span>
        </Link>
      ),
    },
    {
      key: "customer",
      icon: <TeamOutlined />,
      label: (
        <Link to="/admin/customer">
          <span>Khách hàng</span>
        </Link>
      ),
    },
    {
      key: "category",
      icon: <TableOutlined />,
      label: (
        <Link to="/admin/categories">
          <span>Danh mục</span>
        </Link>
      ),
    },
    {
      key: "brand",
      icon: <GroupOutlined />,
      label: (
        <Link to="/admin/brand">
          <span>Thương hiệu</span>
        </Link>
      ),
    },
    {
      key: "coupon",
      icon: <ProjectOutlined />,
      label: (
        <Link to="/admin/coupon">
          <span>Mã giảm giá</span>
        </Link>
      ),
    },
    {
      key: "inbox",
      icon: <MessageOutlined />,
      label: (
        <Link to="/admin/inbox">
          <span>Tin nhắn</span>
        </Link>
      ),
    },
    {
      key: "comment",
      icon: <CommentOutlined />,
      label: (
        <Link to="/admin/comment">
          <span>Bình Luận</span>
        </Link>
      ),
    },
    !isManager && {
      key: "dashboardad",
      icon: <DatabaseOutlined />,
      label: (
        <Link to="/admin/dashboardad">
          <span>Thống kê</span>
        </Link>
      ),
    },
  ];

  return (
    <Layout className="layout-admin">
      {/* Sidebar */}
      <Sider
        className="sider-admin"
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => console.log(broken)}
        onCollapse={(collapsed, type) => console.log(collapsed, type)}
      >
        <div className="demo-logo-vertical">
          <img src={logo} className="logo-admin" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["admin"]}
          items={menuItems}
        />
      </Sider>

      <Layout className="main-layout">
        <Header className="header-admin">
          <Link to="/">
            <Tooltip title="Trang chủ">
              <HomeOutlined
                style={{ fontSize: "24px", cursor: "pointer", color: "black" }}
              />
            </Tooltip>
          </Link>

          <div className="group2">
            {user && (
              <div>
                <Avatar
                  src={user.avatar}
                  alt="Avatar"
                  size="large"
                  style={{ marginRight: 10 }}
                />
                <span>{user.fullname}</span>
              </div>
            )}

            <Tooltip title="Thông báo">
              <BellOutlined style={{ fontSize: "24px", cursor: "pointer" }} />
            </Tooltip>
            <Dropdown overlay={menu} trigger={["hover"]}>
              <Button
                color="primary"
                variant="solid"
                icon={<SettingOutlined />}
              />
            </Dropdown>
            <Tooltip title="Đăng xuất">
              <Button
                color="danger"
                variant="solid"
                icon={<LogoutOutlined />}
                onClick={logoutad}
              />
            </Tooltip>
          </div>
        </Header>

        <Content className="content-admin">
          <div
            className="content-box"
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer className="footer-admin">Design by Group FE</Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
