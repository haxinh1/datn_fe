import { useState } from "react";
import { Button, Rate, Upload, Checkbox, Card, Modal, Row, Col, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const ProductReview = ({ visible, onClose }) => {
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const product = {
        id: 1,
        name: "iPhone siêu chống sốc",
        image: "https://res.cloudinary.com/dzpr0epks/image/upload/v1740494098/rgnqzyjdcyfgk30ebmil.jpg",
        rating: 4.8,
        numReviews: 15,
    };

    const mutation = useMutation({
        mutationFn: async (reviewData) => {
            return axios.post("/api/reviews", reviewData);
        },
        onSuccess: () => {
            message.success("Gửi đánh giá thành công!");
            form.resetFields();
            setFileList([]);
            onClose();
        },
        onError: () => {
            message.error("Có lỗi xảy ra, vui lòng thử lại.");
        },
    });

    const handleUploadChange = ({ file, fileList }) => {
        if (file.status === "done" && file.response) {
            const imageUrl = file.response.secure_url;

            const newFileList = [
                ...fileList.map(f => ({
                    uid: f.uid,
                    name: f.name || "Hình ảnh",
                    status: "done",
                    url: f.response?.secure_url || f.url,
                }))
            ];
            setFileList(newFileList);

            form.setFieldsValue({ images: newFileList.map(f => f.url) });
        } else {
            setFileList(fileList);
        }
    };

    const onRemove = (file) => {
        const newFileList = fileList.filter(item => item.uid !== file.uid);
        setFileList(newFileList);
        form.setFieldsValue({ images: newFileList.map(f => f.url) });
    };

    const onFinish = async (values) => {
        if (values.review.length < 50) {
            message.warning("Đánh giá phải có ít nhất 50 ký tự!");
            return;
        }

        mutation.mutate({
            rating: values.rating,
            review: values.review,
            anonymous: values.anonymous,
            images: fileList.map(f => f.url),
            productId: 1,
        });
    };

    return (
        <Modal title="Đánh giá sản phẩm" open={visible} onCancel={onClose} footer={null}>
            <div className="p-4">
                <Card className="mb-4">
                    <Row align="middle">
                        <Col span={6}>
                            <img src={product.image} alt="product" style={{ width: "100%", borderRadius: 8 }} />
                        </Col>
                        <Col span={18}>
                            <p className="font-semibold">{product.name}</p>
                            <Rate value={product.rating} disabled style={{ fontSize: "14px" }} />
                            <span style={{ color: "gray", fontSize: "14px", marginLeft: 8 }}>({product.numReviews} đánh giá)</span>
                        </Col>
                    </Row>
                </Card>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="rating" label="Đánh giá sản phẩm" initialValue={5}>
                        <Rate />
                    </Form.Item>

                    <Form.Item name="images" label="Tải ảnh lên">
                        <Upload
                            listType="picture-card"
                            action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                            data={{ upload_preset: "quangOsuy" }}
                            onChange={handleUploadChange}
                            onRemove={onRemove}
                            fileList={fileList}
                        >
                            {fileList.length >= 5 ? null : (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="review"
                        label="Viết đánh giá từ 50 ký tự"
                        rules={[{ required: true, message: "Vui lòng nhập đánh giá!" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Hãy chia sẻ nhận xét của bạn!" />
                    </Form.Item>

                    <Form.Item name="anonymous" valuePropName="checked">
                        <Checkbox>Đánh giá ẩn danh</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={mutation.isLoading}>
                            Gửi
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

const ReviewButton = () => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <div className="flex justify-center mt-4">
            <Button type="primary" onClick={() => setModalVisible(true)}>Đánh giá sản phẩm</Button>
            <ProductReview visible={modalVisible} onClose={() => setModalVisible(false)} />
        </div>
    );
};

export default ReviewButton;
