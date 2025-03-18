import { Skeleton, Table, notification, Image, Button, Modal, Form, Input, Select, DatePicker, Row, Col, Upload, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react'; 
import { AuthServices } from '../services/auth';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';

const Info = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [image, setImage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await AuthServices.getAUser(id);
                setUser({
                    fullname: userData.fullname,
                    phone_number: userData.phone_number,
                    email: userData.email,
                    gender: userData.gender || "",
                    birthday: userData.birthday ? dayjs(userData.birthday) : null,
                    avatar: userData.avatar,
                });
    
                // Chuyển đổi URL ảnh thành file khi có ảnh
                if (userData.avatar) {
                    const fileList = await convertImagesToFileList([userData.avatar]);
                    setImage(fileList[0]);  // Cập nhật state image với file đầu tiên
                }
    
                setIsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu người dùng:", error);
                notification.error({
                    message: "Lỗi",
                    description: "Không thể tải dữ liệu người dùng.",
                });
                setIsLoading(false);
            }
        };
    
        fetchUserData();
    }, [id]);    

    const handleUpdate = async (values) => {
        try {
            const userData = {
                ...values,
                avatar: image ? image.url : values.avatar || null,
                gender: values.gender || null,
                birthday: values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : null, 
            };
            const response = await AuthServices.update(id, userData); // Gọi API để cập nhật
            notification.success({
                message: "Cập nhật thành công!",
            });
            form.resetFields();
            setIsModalVisible(false);
            console.log("Dữ liệu đã cập nhật:", response);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            notification.error({
                message: "Lỗi cập nhật",
                description: "Không thể cập nhật thông tin.",
            });
        }
    };

    const onHandleChange = (info) => {
        let fileList = [...info.fileList];
    
        // Nếu ảnh mới được upload thành công, cập nhật `thumbnail`
        if (info.file.status === "done" && info.file.response) {
            fileList = fileList.map((file) => ({
                uid: file.uid,
                name: file.name,
                status: "done",
                url: file.response.secure_url, // Lấy URL từ response Cloudinary
            }));
        }
    
        // Cập nhật state
        setImage(fileList.length > 0 ? fileList[0] : null);
    };      
      
    const urlToFile = async (url, filename) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };
    
    const convertImagesToFileList = async (imageUrls) => {
        const fileList = await Promise.all(
          imageUrls.map(async (url, index) => {
            const file = await urlToFile(url, `image-${index}.jpg`);
            return {
              uid: `img-${index}`,
              name: file.name,
              status: "done",
              url, // Giữ lại URL để hiển thị
              originFileObj: file, // Chuyển đổi thành File object
            };
          })
        );
        return fileList;
    };    
     

    const showModal = () => {
        form.setFieldsValue({
            fullname: user.fullname,
            phone_number: user.phone_number,
            email: user.email,
            gender: user.gender || "",
            birthday: user.birthday ? dayjs(user.birthday) : null,
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: "Tên người dùng",
            dataIndex: "fullname",
            key: "fullname",
            align: "center",
        },
        {
            title: "Ảnh đại diện",
            dataIndex: "avatar",
            key: "avatar",
            render: (avatar) => avatar ? (<Image width={45} src={avatar} />) : null,
            align: "center",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone_number",
            key: "phone_number",
            align: "center",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            align: "center",
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            align: "center",
            render: (gender) => {
                const genderMap = {
                    male: "Nam",
                    female: "Nữ",
                    other: "Khác"
                };
                return genderMap[gender];
            }
        },
        {
            title: "Ngày sinh",
            dataIndex: "birthday",
            key: "birthday",
            align: "center",
            render: (birthday) => birthday ? birthday.format('DD/MM/YYYY') : '',
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center",
            render: (_, item) => (
              <div className="action-container">
                <Tooltip title="Cập nhật">
                  <Button
                    color="primary"
                    variant="solid"
                    icon={<EditOutlined />}
                    onClick={showModal}
                  />
                </Tooltip>
              </div>
            ),
          },
    ];

    return (
        <>
            <Skeleton active loading={isLoading}>
                {user && (
                    <Table
                        columns={columns}
                        dataSource={[user]}  // Truyền dữ liệu người dùng dưới dạng mảng có một phần tử
                        pagination={false}
                        bordered
                    />
                )}
            </Skeleton>

            <Modal
                title="Cập nhật thông tin"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Tên người dùng"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                                name="fullname"
                            >
                                <Input className="input-item" />
                            </Form.Item>

                            <Form.Item
                                label="Số điện thoại"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                name="phone_number"
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Ảnh đại diện"
                                name="avatar"
                            >
                                <Upload
                                    listType="picture-card"
                                    action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                    data={{ upload_preset: "quangOsuy" }}
                                    fileList={image ? [image] : []} // ✅ Hiển thị ảnh đã tải lên
                                    onChange={onHandleChange}
                                    onRemove={() => setImage(null)}
                                >
                                    {!image && (
                                        <button className="upload-button" type="button">
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                        </button>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                label="Email"
                                rules={[{ required: true, message: "Vui lòng nhập Email" }]}
                                name="email"
                            >
                                <Input className="input-item" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item 
                                        name="gender" label="Giới tính" 
                                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                                    > 
                                        <Select className="input-item" placeholder="Chọn giới tính">
                                            <Select.Option value="male">Nam</Select.Option>
                                            <Select.Option value="female">Nữ</Select.Option>
                                            <Select.Option value="other">Khác</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item 
                                        name="birthday" label="Ngày sinh" 
                                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                                    > 
                                        <DatePicker className="input-item" format="DD/MM/YYYY" placeholder="DD/MM/YYYY"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>         
                    </Row>

                    <div className="add">
                        <Button type="primary" htmlType="submit" className='btn-item'>
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default Info;
