import React from "react";
import {
  Button,
  Image,
  notification,
  Skeleton,
  Table,
  Modal,
  Form,
  Select,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { BookOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./list.css";

const List = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/products`);
      return response.data.map((product) => ({
        key: product.id,
        ...product,
      }));
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`http://localhost:3000/products/${id}`);
    },
    onSuccess: () => {
      notification.success({
        message: "Xóa sản phẩm thành công!",
        description: "Sản phẩm đã được xóa khỏi danh sách.",
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      notification.error({
        message: "Xóa sản phẩm thất bại!",
        description: `Đã xảy ra lỗi: ${error.message}`,
      });
    },
  });

  const onDelete = (id) => {
    mutate(id);
  };

  const deleteConfirm = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      content: "Hành động này sẽ không thể phục hồi!",
      okText: "Có",
      cancelText: "Không",
      onOk: () => onDelete(id),
    });
  };

  const columns = [
    {
      title: "",
      render: () => {
        return <input className="tick" type="checkbox" />;
      },
      align: "center",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      align: "center",
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (_, item) => {
        return <Image width={60} src={item.thumbnail} />;
      },
      align: "center",
    },
    {
      title: "Giá bán (VNĐ)",
      key: "sell_price",
      dataIndex: "sell_price",
      align: "center",
    },
    {
      title: "Số lượng",
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (_, item) => {
        return (
          <span>
            {item.category === "idCategory1" ? "Điện thoại" : "Máy tính"}
          </span>
        );
      },
      align: "center",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, item) => (
        <div className="action-container">
          <Link
            to={`/detailad/${product.id}`}
            className="action-link action-link-purple"
          >
            Chi tiết
          </Link>
          <div className="divider"></div>

          <Link to="/edit-pr" className="action-link action-link-blue">
            Cập nhật
          </Link>

          {/* <span
                        className="action-link action-link-red"
                        onClick={() => deleteConfirm(item.id)}
                    >
                        Xóa
                    </span> */}
        </div>
      ),
      align: "center",
    },
  ];

  return (
    <>
      <h1 className="page-title">
        <BookOutlined style={{ marginRight: "8px" }} />
        Danh sách sản phẩm
      </h1>

      <div className="btn">
        <Form.Item label="Danh mục" name="category" className="select-item">
          <Select>
            <Select.Option>Điện thoại</Select.Option>
            <Select.Option>Máy tính</Select.Option>
          </Select>
        </Form.Item>

        <div className="btn-group">
          <Link to="/add-pr">
            <Button color="primary" variant="solid" icon={<PlusOutlined />}>
              Thêm sản phẩm
            </Button>
          </Link>

          <Button color="danger" variant="solid" icon={<DeleteOutlined />}>
            Xóa sản phẩm
          </Button>
        </div>
      </div>

      <Skeleton active loading={isLoading}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 6 }}
        />
      </Skeleton>
    </>
  );
};

export default List;
