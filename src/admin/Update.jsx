import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row, Button, notification, Upload, Select, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthServices } from '../services/auth';
import dayjs from 'dayjs';

const Update = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const navigate = useNavigate()
  const [image, setImage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AuthServices.getAUser(id); // Gọi API để lấy dữ liệu người dùng
        setUser(userData);  // Lưu dữ liệu vào state

        // Chuyển đổi ảnh cũ thành file list để hiển thị
        if (userData.avatar) {
          const fileList = await convertImagesToFileList([userData.avatar]);
          setImage(fileList[0]);
        }

        form.setFieldsValue({
          fullname: userData.fullname,
          phone_number: userData.phone_number,
          email: userData.email,
          gender: userData.gender || "",
          birthday: userData.birthday ? dayjs(userData.birthday) : null,
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải dữ liệu người dùng.",
        });
      }
    };

    fetchUserData();
  }, [id, form]);

  const handleSubmit = async (values) => {
    try {
      const userData = {
        ...values,
        avatar: image ? image.url : values.avatar || null,
        gender: values.gender || null,  // Xử lý trường gender nếu không có giá trị
        birthday: values.birthday ? dayjs(values.birthday).format('YYYY-MM-DD') : null,// Xử lý trường birthday nếu không có giá trị
      };
      const response = await AuthServices.update(id, userData); // Gọi service update
      notification.success({
        message: "Cập nhật tài khoản thành công!",
      });
      navigate("/admin/list-pr")
      console.log("Dữ liệu đã cập nhật:", response);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      notification.error({
        message: "Lỗi cập nhật",
        description: "Không thể cập nhật tài khoản.",
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

  return (
    <div>
      <h1 className="mb-5">
        <EditOutlined style={{ marginRight: "8px" }} />
        Cập nhật tài khoản
      </h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={24}>
          <Col span={3}></Col>
          <Col span={8}>
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

          <Col span={8}>
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
          <Col span={3}></Col>
          <Col span={8}>
            <Form.Item
              label="Email"
              rules={[{ required: true, message: "Vui lòng nhập Email" }]}
              name="email"
            >
              <Input className="input-item" />
            </Form.Item>
          </Col>

          <Col span={8}>
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
                  <DatePicker className="input-item" format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
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
    </div>
  );
};

export default Update;
