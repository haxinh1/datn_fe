import { useState } from "react";
import { Button, Rate, Upload, Checkbox, Card, Modal, Row, Col, Form, Input, message, Image } from "antd";
import { CommentOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { CommentServices } from "../services/comment";
import formatVND from './../utils/formatPrice';

const ProductReview = ({ visible, onClose, product, orderId, setIsDisable }) => {
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();

    const mutation = useMutation({
        mutationFn: CommentServices.createComment,
        onSuccess: () => {
            message.success("Gửi đánh giá thành công!");
            form.resetFields();
            setFileList([]);
            setIsDisable(true);
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
            order_id: Number(orderId)

        });
    };

    return (
        <Modal
            title="Đánh giá sản phẩm"
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Card className="mb-4">
                <Row align="middle">
                    <Col span={6}>
                        <Image
                            src={product.variants.length > 0 ? product.variants[0].variant_thumbnail : product.thumbnail}
                            width={90}
                        />
                    </Col>

                    <Col span={18}>
                        <span className="font-semibold">
                            {product.name}
                            {product.variants.length > 0 && (
                                <>{" - "}{product.variants[0].attributes.map(attr => attr.attribute_name).join(" - ")}</>
                            )}
                        </span>

                        {product.variants.length > 0 && (
                            <p style={{ fontSize: "14px", marginTop: 8 }}>
                                <strong>Giá bán: </strong>
                                {formatVND(product.variants[0].sell_price)} VNĐ
                            </p>
                        )}

                    </Col>
                </Row>
            </Card>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="review"
                    label="Viết đánh giá"
                    rules={[{ required: true, message: "Vui lòng nhập đánh giá!" }]}
                >
                    <Input.TextArea rows={4} placeholder="Hãy chia sẻ nhận xét của bạn!" />
                </Form.Item>

                <Form.Item name="images" label="Ảnh đánh giá">
                    <Upload
                        multiple
                        listType="picture-card"
                        action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                        data={{ upload_preset: "quangOsuy" }}
                        onChange={handleUploadChange}
                        onRemove={onRemove}
                        fileList={fileList}
                    >
                        {fileList.length >= 4 ? null : (
                            <button className="upload-button" type="button">
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                            </button>
                        )}
                    </Upload>
                </Form.Item>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="rating" label="Đánh giá sản phẩm" initialValue={5}>
                            <Rate />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="anonymous" valuePropName="checked">
                            <Checkbox>Đánh giá ẩn danh</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="add">
                    <Button 
                        className="btn-item"
                        type="primary" htmlType="submit" 
                        block loading={mutation.isLoading}
                    >
                        Gửi
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

const ReviewButton = ({ product, orderId }) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [isDisable, setIsDisable] = useState(false);

    return (
        <>
            <Button
                type="primary"
                disabled={isDisable || product.has_reviewed}
                onClick={() => setModalVisible(true)}
                icon={<CommentOutlined />}
            >
                Đánh giá
            </Button>

            <ProductReview product={product} setIsDisable={setIsDisable} orderId={orderId} visible={modalVisible} onClose={() => setModalVisible(false)} />
        </>
    );
};

export default ReviewButton;
