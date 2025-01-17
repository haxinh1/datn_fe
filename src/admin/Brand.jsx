import React, { useState } from "react";
import { Button, Form, Input, Skeleton, Table, notification, Modal } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import "../admin/product/add.css";
import "../admin/product/list.css";

const Brand = () => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    // Fetch danh sách thương hiệu
    const { data: brands, isLoading } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/brands`);
            return response.data.data;
        },
    });

    // Tạo thương hiệu mới
    const addBrandMutation = useMutation({
        mutationFn: async (newBrand) => {
            await axios.post(`http://127.0.0.1:8000/api/brands`, newBrand);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["brands"]);
            form.resetFields();
            notification.success({
                message: "Thêm thương hiệu thành công!",
            });
        }
    });

    // Xóa thương hiệu
    const deleteBrandMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(`http://127.0.0.1:8000/api/brands/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["brands"]);
            notification.success({
                message: "Xóa thương hiệu thành công!",
            });
        },
        onError: () => {
            notification.error({
                message: "Xóa thương hiệu thất bại!",
            });
        },
    });

    const handleDeleteBrand = (id) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa thương hiệu này không?",
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: () => deleteBrandMutation.mutate(id),
        });
    };

    const handleAddBrand = (values) => {
        addBrandMutation.mutate(values);
    };

    const columns = [
        {
            title: "Tên thương hiệu",
            dataIndex: "name",
            key: "name",
            render: (text) => <a>{text}</a>,
            align: "center",
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            align: "center",
        },
        {
            title: "Logo",
            dataIndex: "logo",
            key: "logo",
            render: (logo) => (
                <img
                    src={logo}
                    alt="Logo"
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
            ),
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, item) => (
                <div className="action-container">
                    <Link to="" className="action-link action-link-blue">
                        Cập nhật
                    </Link>

                    <div className="divider"></div>

                    <span
                        className="action-link action-link-red"
                        onClick={() => handleDeleteBrand(item.id)}
                    >
                        Xóa
                    </span>
                </div>
            ),
            align: "center",
        },
    ];

    if (isLoading) {
        return <Skeleton active />;
    }

    return (
        <div className="container">
            <h1 className="mb-5">Quản lý thương hiệu</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleAddBrand}
                className="attribute"
            >
                <Form.Item
                    label="Tên thương hiệu"
                    name="name"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên thương hiệu" },
                    ]}
                >
                    <Input className="input-item" placeholder="Nhập tên thương hiệu" />
                </Form.Item>

                <Form.Item
                    label="Slug"
                    name="slug"
                    rules={[
                        { required: true, message: "Vui lòng nhập slug" },
                    ]}
                >
                    <Input className="input-item" placeholder="Nhập slug của thương hiệu" />
                </Form.Item>

                <Form.Item
                    label="Logo"
                    name="logo"
                    rules={[
                        { required: true, message: "Vui lòng nhập URL của logo" },
                    ]}
                >
                    <Input className="input-item" placeholder="Nhập URL logo" />
                </Form.Item>

                <Button type="primary" htmlType="submit" className="btn-item">
                    Tạo thương hiệu
                </Button>
            </Form>

            <Table
                columns={columns}
                dataSource={brands}
                pagination={false}
                rowKey={(record) => record.id}
            />
        </div>
    );
};

export default Brand;
