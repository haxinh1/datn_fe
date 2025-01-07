import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { HomeOutlined, BookOutlined, FormOutlined, UserOutlined, ShoppingCartOutlined, BilibiliFilled, MessageOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const LayoutAdmin = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "list-pr",
      icon: <BookOutlined />,
      label: <Link to="#">Quản lý sản phẩm</Link>,
    },
    {
      key: "category",
      icon: <BilibiliFilled />,
      label: <Link to="/categories">Thể Loại</Link>,
    },
    {
      key: "register",
      icon: <FormOutlined />,
      label: <Link to="#">Đăng ký</Link>,
    },
    {
      key: "login",
      icon: <UserOutlined />,
      label: <Link to="#">Đăng nhập</Link>,
    },
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="#">Trang chủ</Link>,
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["admin"]} items={menuItems} />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: 200 }}> {/* Bù lại chiều rộng của Sider */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          <Breadcrumb style={{ margin: "16px 0" }} />
          <div
            style={{
              padding: 24,
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
