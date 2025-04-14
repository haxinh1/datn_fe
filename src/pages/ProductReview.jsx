import { useState } from "react";
import { Button, Rate, Upload, Checkbox, Card, Modal, Row, Col, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CommentServices } from "../services/comment";
import formatVND from './../utils/formatPrice';

const ProductReview = ({ visible, onClose, product }) => {
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();

    const mutation = useMutation({
        mutationFn: CommentServices.createComment,
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
        if (values.review.length < 5) {
            message.warning("Đánh giá phải có ít nhất 5 ký tự!");
            return;
        }

        mutation.mutate({
            rating: values.rating,
            comments: values.review,
            anonymous: values.anonymous,
            images: fileList.map(f => f.url),
            products_id: product.product_id,
        });
    };

    return (
        <Modal title="Đánh giá sản phẩm" open={visible} onCancel={onClose} footer={null}>
            <div className="p-4">
                <Card className="mb-4">
                    <Row align="middle">
                        <Col span={6}>
                            <img
                                src={product.variants.length > 0 ? product.variants[0].variant_thumbnail : product.thumbnail}
                                alt="product"
                                style={{ width: "100%", borderRadius: 8 }}
                            />
                        </Col>
                        <Col span={18}>
                            <p className="font-semibold">{product.name}</p>
                            <Rate value={product.rating} disabled style={{ fontSize: "14px" }} />
                            <span style={{ color: "gray", fontSize: "14px", marginLeft: 8 }}>
                                ({product.numReviews} đánh giá)
                            </span>
                            {product.variants.length > 0 && (
                                <div>
                                    <p style={{ fontSize: "14px", marginTop: 8 }}>
                                        <strong>Biến thể:</strong>{" "}
                                        {product.variants.map((variant, index) => (
                                            <span key={variant.variant_id}>
                                                {variant.attributes.map((attr) => attr.attribute_name).join(", ")}
                                                {index < product.variants.length - 1 ? "; " : ""}
                                            </span>
                                        ))}
                                    </p>
                                    <p style={{ fontSize: "14px" }}>
                                        <strong>Giá: </strong>
                                        {formatVND(product.variants[0].sell_price)} VNĐ
                                    </p>
                                </div>
                            )}
                            {product.variants.length === 0 && (
                                <p style={{ fontSize: "14px", marginTop: 8 }}>
                                    <strong>Giá:</strong> {product.sell_price} VNĐ
                                </p>
                            )}
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
                        label="Viết đánh giá"
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

const ReviewButton = ({ product }) => {
    const [modalVisible, setModalVisible] = useState(false);


    return (
        <>
            <Button type="primary" onClick={() => setModalVisible(true)}>Đánh giá sản phẩm</Button>
            <ProductReview product={product} visible={modalVisible} onClose={() => setModalVisible(false)} />
        </>
    );
};

export default ReviewButton;
