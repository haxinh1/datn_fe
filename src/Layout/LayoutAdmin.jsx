import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FormOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BilibiliFilled,
  MessageOutlined,
} from "@ant-design/icons";

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
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        style={{
          height: "100vh",
          position: "fixed", // Cố định Sidebar
          left: 0,
          top: 0,
          zIndex: 10,
        }}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => console.log(broken)}
        onCollapse={(collapsed, type) => console.log(collapsed, type)}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: "32px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["admin"]}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: 100 }}>
        {" "}
        {/* Bù lại chiều rộng của Sider */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: "12px 12px 0",
          }}
        >
          <Breadcrumb style={{ margin: "12px 0" }} />
          <div
            style={{
              padding: 0,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Design by quang0suy</Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
