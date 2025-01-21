import React, { useState } from "react";
import { Button, Form, Input, Skeleton, Table, notification, Modal, Row, Col, Upload, Image } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "../admin/product/add.css";
import "../admin/product/list.css";
import { BrandsServices } from "../services/brands";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const Brand = () => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [logo, setLogo] = useState(null);

    const showModal = () => setIsModalVisible(true);
    const hideModal = () => setIsModalVisible(false);

    // Fetch danh sách thương hiệu
    const { data: brands, isLoading } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await BrandsServices.fetchBrands();
            return response.data;
        },
        onError: (error) => {
            notification.error({
                message: "Không thể tải danh sách thương hiệu",
                description: error.response?.data?.message || error.message,
            });
        },
    });

    // Tạo thương hiệu mới
    const addBrandMutation = useMutation({
        mutationFn: async (brand) => {
            return await BrandsServices.createBrand(brand);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["brands"]);
            form.resetFields();
            hideModal();
            notification.success({
                message: "Thêm thương hiệu thành công!",
            });
        },
        onError: (error) => {
            notification.error({
                message: "Thêm thương hiệu thất bại!",
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            setLogo(info.file.response.secure_url);
        } 
    };

    const handleAddBrand = (values) => {
        addBrandMutation.mutate({ ...values, logo });
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        form.setFieldsValue({
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
        });
    };

    const columns = [
        {
            title:"",
            render:() => { return <input className="tick" type="checkbox" />},
            align: "center"
        },
        {
            title: "Tên thương hiệu",
            dataIndex: "name",
            key: "name",
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
            render: (_, item) => {
                return <Image width={60} src={item.logo} />;
            },
            align: "center",
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    <Link to='' className="action-link action-link-blue">
                        Cập nhật
                    </Link>
                    <div className="divider"></div>
                    <span className="action-link action-link-red">Xóa</span>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return <Skeleton active />;
    }

    return (
        <div className="container">
            <h1 className="mb-5">Quản lý thương hiệu</h1>

            <div className="btn-group">
                <Button
                    color="primary" 
                    variant="solid"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                >
                    Thêm thương hiệu
                </Button>

                <Button
                    color="danger" 
                    variant="solid"
                    icon={<DeleteOutlined />}
                >
                    Xóa thương hiệu
                </Button>
            </div>

            <Modal
                title="Tạo thương hiệu mới"
                visible={isModalVisible}
                onCancel={hideModal}
                footer={null}
                bodyStyle={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddBrand}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên thương hiệu"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
                            >
                                <Input className="input-item" onChange={handleNameChange} />
                            </Form.Item>

                            <Form.Item
                                label="Slug"
                                name="slug"
                                rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item 
                                label="Logo" 
                                name="logo"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                                rules={[
                                    {
                                        validator: (_, value) =>
                                            logo ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh sản phẩm"),
                                    },
                                ]}
                            >
                                <Upload 
                                    listType="picture-card" 
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{upload_preset: "quangOsuy"}}
                                    onChange={onHandleChange}
                                >
                                    <button className="upload-button" type="button">
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                    </button>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <div className="add">
                        <Button type="primary" size="large" htmlType="submit">
                            Xác nhận
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Table
                columns={columns}
                dataSource={brands || []}
                pagination={false}
                rowKey={(record) => record.id}
            />
        </div>
    );
};

export default Brand;
