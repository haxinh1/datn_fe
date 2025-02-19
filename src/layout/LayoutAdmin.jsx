import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme, Modal } from "antd"; // Import Modal từ Ant Design
import {
  HomeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  BilibiliFilled,
  MessageOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import "./layoutAdmin.css";
import { AuthServices } from "../services/auth";

const { Header, Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const nav = useNavigate();

  const logoutad = async () => {
    // Hiển thị Modal xác nhận trước khi logout
    Modal.confirm({
      title: "Bạn chắc chắn muốn đăng xuất?",
      content:
        "Nếu bạn đăng xuất, bạn sẽ phải đăng nhập lại để tiếp tục sử dụng ứng dụng.",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const tokenBefore = localStorage.getItem("adminToken");
          console.log("Token before logout:", tokenBefore); // Kiểm tra token trước khi logout

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
          nav("/loginad"); // Điều hướng về trang đăng nhập
        }
      },
    });
  };

  const menuItems = [
    {
      key: "",
      icon: <UserOutlined />,
      label: `Xin chào Admin`,
      disabled: true,
    },
    {
      key: "list-pr",
      icon: <BookOutlined />,
      label: <Link to="/list-pr">Quản lý sản phẩm</Link>,
    },
    {
      key: "history",
      icon: <BookOutlined />,
      label: <Link to="history">Quản lý nhập hàng</Link>,
    },
    {
      key: "category",
      icon: <BilibiliFilled />,
      label: <Link to="/categories">Danh mục</Link>,
    },
    {
      key: "brand",
      icon: <BilibiliFilled />,
      label: <Link to="/brand">Thương hiệu</Link>,
    },
    {
      key: "bill",
      icon: <BilibiliFilled />,
      label: <Link to="/bill">Hóa đơn</Link>,
    },
    {
      key: "inbox",
      icon: <MessageOutlined />,
      label: <Link to="/inbox">Tin nhắn</Link>,
    },

    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/home">Trang chủ</Link>,
    },
    {
      key: "logoutad",
      icon: <LogoutOutlined />,
      label: <span onClick={logoutad}>Đăng xuất</span>,
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
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["admin"]}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <Layout className="main-layout">
        <Header
          className="header-admin"
          style={{ background: colorBgContainer }}
        />

        <Content className="content-admin">
          <Breadcrumb className="breadcrumb-admin" />
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
