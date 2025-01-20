import React from "react";
import { Button, Image, notification, Skeleton, Table, Modal, Form, Select } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./list.css";
import { productsServices } from "../../services/product";

const List = () => {
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await productsServices.fetchProducts();
            return response.data;
        },
        onError: (error) => {
            notification.error({
                message: "Không thể tải danh sách thương hiệu",
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const columns = [
        {
            title: "",
            render: () => <input className="tick" type="checkbox" />,
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
            title: "brand",
            dataIndex: "brand_id",
            key: "brand_id",
            align: "center",
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, item) => (
                <div className="action-container">
                    <Link to="/detailad" className="action-link action-link-purple">
                        Chi tiết
                    </Link>
                    <div className="divider"></div>

                    <Link to="/edit-pr" className="action-link action-link-blue">
                        Cập nhật
                    </Link>
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
                    dataSource={products || []}
                    pagination={{ pageSize: 6 }}
                />
            </Skeleton>
        </>
    );
};

export default List;