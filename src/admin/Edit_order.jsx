import { Button, Form, Image, Input, message, notification, Row, Select, Table, Upload } from 'antd'
import React, { useEffect, useState } from 'react'
import { Col } from 'antd';
import { OrderService } from '../services/order';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

const Edit_order = () => {
    const [image, setImage] = useState("");
    const [form] = Form.useForm();
    const { id } = useParams();
    const [tableData, setTableData] = useState([]);
    const navigate = useNavigate()

    // danh sách trạng thái
    const { data: statusData } = useQuery({
        queryKey: ["status"],
        queryFn: async () => {
            const response = await OrderService.getAllStatus();
            return response.data
        },
    });

    // lấy ra đơn hàng theo ID
    const { data: orderStatuses } = useQuery({
        queryKey: ["orderStatuses", id],
        queryFn: async () => {
            if (!id) return { data: [] };
            const response = await OrderService.getOrderStatus(id);
            console.log("🚀 API Response:", response); // ✅ Debug API ngay sau khi gọi
            return response || { data: [] };
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (orderStatuses?.data?.length > 0) {
            const formattedData = orderStatuses.data.map((item, index) => ({
                key: index,
                index: index + 1,
                status: item.status?.name,
                note: item.note,
                employee_evidence: item.employee_evidence,
                modified_by: item.modified_by?.fullname,
                created_at: item.created_at
                    ? dayjs(item.created_at).format("DD/MM/YYYY - HH:mm")
                    : "Không có thông tin",
            }));
            setTableData(formattedData);
        }
    }, [orderStatuses]);

    const status = statusData ? [...statusData].sort((a, b) => a.id - b.id) : [];

    const { mutate: updateOrderStatus, isLoading } = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await OrderService.updateOrderStatus(id, data);
            return response.data; // Đảm bảo nhận phản hồi đúng từ API
        },
        onSuccess: () => {
            notification.success({
                message: "Cập nhật trạng thái đơn hàng thành công!",
            });
            navigate("/admin/order"); // ✅ Điều hướng về danh sách đơn hàng
        },
        onError: (error) => {
            console.error("Lỗi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
            });
        }
    });
    
    // ✅ Hàm cập nhật trạng thái đơn hàng
    const handleUpdateOrder = async (values) => {
        const payload = {
            order_status_id: values.status_id,
            note: values.note || "",
            employee_evidence: values.employee_evidence || image || ""
        };
    
        console.log("Dữ liệu gửi đi:", payload); // Debug
        updateOrderStatus({ id, data: payload });
    };    

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    
    const onHandleChange = (info) => {
        if (info.file.status === "done" && info.file.response) {
            const imageUrl = info.file.response.secure_url;
            setImage(imageUrl);
            form.setFieldsValue({ employee_evidence: imageUrl }); // Cập nhật giá trị vào form dưới dạng string
        }
    }; 

    const columns = [
        { 
            title: "STT", 
            dataIndex: "index", 
            key: "index", 
            align: "center" 
        },
        { 
            title: "Trạng thái", 
            dataIndex: "status", 
            key: "status", 
            align: "center",
            render: (status) => <div className='action-link-blue'>{status}</div>
        },
        { 
            title: "Ghi chú", 
            dataIndex: "note", 
            key: "note", 
            align: "center" 
        },
        {
            title: "Ảnh xác nhận",
            dataIndex: "employee_evidence",
            key: "employee_evidence",
            align: "center",
            render: (employee_evidence) => <Image width={60} height={90} src={employee_evidence} />,
        },
        { 
            title: "Người cập nhật", 
            dataIndex: "modified_by", 
            key: "modified_by", 
            align: "center" 
        },
        { 
            title: "Ngày cập nhật", 
            dataIndex: "created_at", 
            key: "created_at", 
            align: "center" 
        },
    ];

    return (
        <div>
            <h1 className="mb-5">Cập nhật trạng thái đơn hàng</h1>
            <Form
                form={form}
                layout='vertical'
                onFinish={handleUpdateOrder}
            >
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item label="Trạng thái đơn hàng" name="status_id">
                            <Select
                                className="input-item"
                                placeholder="Trạng thái"
                                showSearch
                                value={form.getFieldValue("status_id")} // ✅ Đảm bảo giá trị được hiển thị
                                onChange={(value) => form.setFieldsValue({ status_id: value })}
                            >
                                {status.map((item) => (
                                    <Select.Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Ghi chú"
                            name="note"
                        >
                            <Input className="input-item" />
                        </Form.Item>
                    </Col>

                    <Col span={8} className="col-item">
                    <Form.Item
                            label="Ảnh xác nhận"
                            name="employee_evidence"
                            getValueFromEvent={(e) => e?.file?.response?.secure_url || ""}
                        >
                            <Upload
                                listType="picture-card"
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{ upload_preset: "quangOsuy" }}
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

                <Button htmlType="submit" type="primary" className="btn-item">
                    Cập nhật
                </Button>
            </Form>

            <hr />
            <h1 className="mb-5">Lịch sử cập nhật</h1>
            <Table
                columns={columns}
                dataSource={tableData}
                bordered
            />
        </div>
    )
}

export default Edit_order