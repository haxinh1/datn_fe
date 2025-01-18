import React, { useState } from 'react';
import { Form, Input, Button, notification, Row, Col, Image, Radio } from 'antd';
import { CreditCardOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import QR from '/src/assets/img/QR.jpg';

const Pay = () => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        notification.success({
        message: 'Thanh toán thành công!',
        description: 'Đơn hàng của bạn đã được xác nhận và đang được xử lý.',
        });
    };

    const handleFinishFailed = () => {
        notification.error({
        message: 'Thanh toán thất bại!',
        description: 'Vui lòng kiểm tra lại thông tin và thử lại.',
        });
    };

    return (
        <div >
            <h1 style={{ fontSize: '2rem', color: "green" }} className="mb-5">
                <CreditCardOutlined style={{ marginRight: '8px' }} />
                Xác nhận thanh toán
            </h1>

            <Row gutter={24}>
                <Col span={12}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3>Phương thức thanh toán</h3>
                        <Radio.Group>
                            <Radio style={{ display: 'block', marginBottom: '10px' }} value="pay1">
                                Thanh toán khi nhận hàng
                            </Radio>
                            <Radio style={{ display: 'block', marginBottom: '10px' }} value="pay22">
                                Chuyển khoản đến tài khoản ngân hàng
                            </Radio>
                        </Radio.Group>
                    </div>


                    <div style={{ textAlign: 'center'}}>
                        <h3>Quét mã QR để thanh toán</h3>
                        <Image 
                        src={QR} 
                        alt="QR Code" 
                        width={300} 
                        />
                    </div>
                </Col>
                
                <Col span={12}>
                    <div style={{ textAlign: 'center', marginBottom: '20px', marginRight: "280px" }}>
                        <h3>Thông tin giao hàng</h3>
                    </div>
                    
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFinish}
                        onFinishFailed={handleFinishFailed}
                    >
                        <Form.Item
                            label="Tên người nhận hàng"
                            name="fullname"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Nhập tên" style={{width: "400px"}}/>
                        </Form.Item>

                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" style={{width: "400px"}}/>
                        </Form.Item>

                        <div style={{ textAlign: 'center', marginBottom: '20px', marginRight: "280px" }}>
                            <h3>Địa chỉ giao hàng</h3>
                        </div>

                        <Form.Item
                            label="Tỉnh/Thành phố"
                            name="province"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Tỉnh/Thành phố" style={{width: "400px"}}/>
                        </Form.Item>

                        <Form.Item
                            label="Quận/Huyện"
                            name="district"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Quận/Huyện" style={{width: "400px"}}/>
                        </Form.Item>

                        <Form.Item
                            label="Phường/Xã"
                            name="ward"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Phường/Xã" style={{width: "400px"}}/>
                        </Form.Item>

                        <Form.Item
                            label="Tên đường, tòa nhà, số nhà"
                            name="street"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Cụ thể" style={{width: "400px"}}/>
                        </Form.Item>

                        <Form.Item>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={<CreditCardOutlined />} 
                                size="large"
                                style={{ backgroundColor: 'green', width: "400px" }}
                            >
                                Xác nhận
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default Pay;
