import { CloseCircleOutlined, RollbackOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Image, Skeleton, Table, Tooltip, Upload, Modal, notification } from "antd";
import React, { useState } from "react";
import { OrderService } from "../services/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import "../css/bill.css";

const Cancel = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const hideModal = () => setIsModalOpen(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [image, setImage] = useState("");
    const queryClient = useQueryClient();

    // Danh sách đơn hàng
    const { data: cancels, isLoading } = useQuery({
        queryKey: ["complete"],
        queryFn: async () => {
            const response = await OrderService.getAllCancel();
            return Array.isArray(response.order_cancels) ? response.order_cancels : [];
        },
    });

    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ refund_proof: imageUrl });
        } else if (info.file.status === "removed") {
            setImage("");
            form.setFieldsValue({ refund_proof: "" });
        }
    };

    // Thêm mutation để gọi API hoàn tiền
    const refundMutation = useMutation({
        mutationFn: ({ id, refund_proof, user_id }) => OrderService.cancelBack(id, { refund_proof, user_id }),
        onSuccess: () => {
            notification.success({
                message: 'Xác nhận hoàn tiền thành công!',
            });

            // Invalidate query để gọi lại API và lấy dữ liệu mới
            queryClient.invalidateQueries(["complete"]);

            // Đóng modal và reset form
            hideModal();
            setImage("");
            setSelectedItem(null);
            form.resetFields();
        },
        onError: (error) => {
            console.error("Lỗi hoàn tiền:", error);
            notification.error({
                message: "Error",
                description: "Không thể xác nhận hoàn tiền. Vui lòng thử lại sau!",
            });
        }
    });

    // Hàm submit khi bấm nút Xác nhận
    const onFinishRefund = async () => {
        try {
            await form.validateFields();
            if (!selectedItem || !image) {
                notification.error({
                    message: "Error",
                    description: "Vui lòng chọn đơn hàng và tải lên minh chứng hoàn tiền!",
                });
                return;
            }
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?.id;
            if (!userId) {
                notification.error({
                    message: "Error",
                    description: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!",
                });
                return;
            }
            const payload = {
                id: selectedItem.id,
                refund_proof: image,
                user_id: userId,
            };
            console.log("Payload gửi đi:", payload);
            refundMutation.mutate(payload);
        } catch (error) {
            console.error("Error submitting refund:", error);
            notification.error({
                message: "Error",
                description: "Không thể gửi yêu cầu hoàn tiền. Vui lòng thử lại sau!",
            });
        }
    };

    // Tách số thành định dạng tiền tệ
    const formatPrice = (price) => {
        const formatter = new Intl.NumberFormat("de-DE", {
            style: "decimal",
            maximumFractionDigits: 0,
        });
        return formatter.format(price);
    };

    const getReturnReason = (note) => {
        switch (note) {
            case "mistake":
                return "Đặt nhầm sản phẩm";
            case "better":
                return "Tìm thấy ưu đãi tốt hơn";
            case "size_change":
                return "Đổi size/màu";
            case "error":
                return "Sản phẩm bị hư, hỏng khi vận chuyển";
            case "disconnect":
                return "Không thể liên hệ với người đặt";
            case "other":
                return "Khác";
            default:
                return note || "";
        }
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            align: "center",
            render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
        },
        {
            title: "Mã đơn hàng",
            dataIndex: "order",
            key: "order",
            align: "center",
            render: (order) => order?.code ?? "",
        },
        {
            title: "Lý do hủy đơn",
            dataIndex: "reason",
            key: "reason",
            align: "center",
            render: (reason) => getReturnReason(reason)
        },
        {
            title: "Ngày hủy",
            dataIndex: "created_at",
            key: "created_at",
            align: "center",
            render: (created_at) => created_at ? dayjs(created_at).format("DD/MM/YYYY") : "",
        },
        {
            title: "Giá trị đơn hàng (VNĐ)",
            dataIndex: "order",
            key: "order_total_amount",
            align: "center",
            render: (order) => order?.total_amount ? formatPrice(order.total_amount) : "",
        },
        {
            title: "Thông tin hoàn tiền",
            dataIndex: "bank_name",
            key: "bank_name",
            align: "center",
            render: (_, record) => (
                <div>
                    <div>{record.bank_account_number} - {record.bank_name}</div>
                    {record.bank_qr && (
                        <div>
                            <Image width={60} src={record.bank_qr} />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Xác nhận hoàn tiền",
            dataIndex: "refund_proof",
            key: "refund_proof",
            align: "center",
            render: (_, item) => {
                return item.refund_proof ? (
                    <Image width={60} src={item.refund_proof} />
                ) : null;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status_id",
            key: "status_id",
            align: "center",
            render: (status_id) => {
                if (status_id === 8) {
                    return <span className="action-link-red">Hủy đơn - Chờ hoàn tiền</span>;
                }
                if (status_id === 12) {
                    return <span className="action-link-blue">Đã hoàn tiền</span>;
                }
                return null;
            },
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, item) => (
                <div className="action-container">
                    {item.status_id === 8 && (
                        <Tooltip title="Hoàn tiền">
                            <Button
                                color="danger"
                                variant="solid"
                                icon={<RollbackOutlined />}
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                }}
                            />
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="mb-5">
                <CloseCircleOutlined style={{ marginRight: "8px" }} />
                Đơn hủy
            </h1>

            <Skeleton active loading={isLoading}>
                <Table
                    columns={columns}
                    dataSource={cancels}
                    pagination={{ pageSize: 10, current: currentPage }}
                    rowKey="id"
                    onChange={(pagination) => setCurrentPage(pagination.current)}
                    bordered
                />
            </Skeleton>

            <Modal
                title="Xác nhận hoàn tiền"
                open={isModalOpen}
                onCancel={hideModal}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={onFinishRefund}
                    form={form}
                >
                    <Form.Item
                        label="Minh chứng"
                        name="refund_proof"
                        rules={[{ required: true, message: "Vui lòng tải lên ảnh minh chứng" }]}
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

                    <div className="add">
                        <Button color="primary" variant="solid" htmlType="submit">
                            Gửi
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Cancel;