import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  BilibiliFilled,
  MessageOutlined,
} from "@ant-design/icons";
import "./layoutAdmin.css";

const { Header, Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "list-pr",
      icon: <BookOutlined />,
      label: <Link to="/list-pr">Quản lý sản phẩm</Link>,
    },
    {
      key: "category",
      icon: <BilibiliFilled />,
      label: <Link to="/categories">Thể Loại</Link>,
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
      key: "register",
      icon: <FormOutlined />,
      label: <Link to="/register">Đăng ký</Link>,
    },
    {
      key: "login",
      icon: <UserOutlined />,
      label: <Link to="/login">Đăng nhập</Link>,
    },
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/home">Trang chủ</Link>,
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