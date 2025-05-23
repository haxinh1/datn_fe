import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, InputNumber, Form, notification, Row, Col, Upload, Radio, Switch, Tooltip, DatePicker } from "antd";
import { BarsOutlined, DeleteOutlined, EditOutlined, InsertRowLeftOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import slugify from "slugify";
import { productsServices } from './../../services/product';
import { BrandsServices } from './../../services/brands';
import { categoryServices } from './../../services/categories';
import { AttributesServices } from './../../services/attributes';
import { ValuesServices } from './../../services/attribute_value';
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../css/add.css";

const { Option } = Select;

const Edit = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [forms, setForms] = useState([{ id: Date.now(), name: "", values: [] }]);
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [valueForm] = Form.useForm();
    const [attForm] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null);
    const [images, setImages] = useState([]);
    const [productType, setProductType] = useState("single");
    const [selectedAttributeId, setSelectedAttributeId] = useState(null);
    const [tableData, setTableData] = useState([]); // Dữ liệu bảng
    const navigate = useNavigate()

    const handleDateChange = (date, type, record) => {
        const updatedTableData = tableData.map((item) => {
            if (item.key === record.key) {
                if (type === "start") {
                    return { ...item, sale_price_start_at: date ? date.format("YYYY-MM-DD") : null };
                }
                if (type === "end") {
                    return { ...item, sale_price_end_at: date ? date.format("YYYY-MM-DD") : null };
                }
            }
            return item;
        });
        setTableData(updatedTableData);
    };

    // Lấy dữ liệu sản phẩm theo id
    const { data: product } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const response = await productsServices.fetchProductById(id);
            return response.data;
        }
    });

    // Đổ dữ liệu sản phẩm vào form khi dữ liệu sẵn sàng
    useEffect(() => {
        if (product) {
            form.setFieldsValue({
                name: product.name,
                sell_price: product.sell_price,
                sale_price: product.sale_price,
                slug: product.slug,
                name_link: product.name_link,
                brand_id: product.brand_id,
                content: product.content,
                category: product.categories?.map((cat) => cat.id),
                is_active: product.is_active === 1,
                // Chuyển đổi ngày thành đối tượng dayjs để truyền vào DatePicker
                sale_price_start_at: product.sale_price_start_at ? dayjs(product.sale_price_start_at) : null,
                sale_price_end_at: product.sale_price_end_at ? dayjs(product.sale_price_end_at) : null,
            });

            // Chuyển đổi ảnh bìa từ URL thành file object để hiển thị
            if (product.thumbnail) {
                setThumbnail({
                    uid: "-1",
                    name: "thumbnail.jpg",
                    status: "done",
                    url: product.thumbnail,
                });
            }

            // Chuyển đổi ảnh sản phẩm từ URL thành fileList
            if (product.galleries?.length) {
                convertImagesToFileList(product.galleries.map(g => g.image)).then(setImages);
            }
        }
    }, [product, form]);

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

    // cập nhật sản phẩm
    const { mutate: updateProduct } = useMutation({
        mutationFn: async (updatedData) => {
            await productsServices.updateProduct(id, updatedData);
        },
        onSuccess: () => {
            notification.success({
                message: "Cập nhật sản phẩm thành công!",
                description: "Thông tin của sản phẩm đã được cập nhật.",
            });
            queryClient.invalidateQueries(["product", id]);
            navigate("/admin/list-pr");
        },
        onError: (error) => {
            notification.error({
                message: "Cập nhật sản phẩm thất bại",
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const onFinish = (values) => {
        // Kiểm tra và giữ giá trị cũ cho attribute_values_id nếu không thay đổi
        const currentAttributeValuesId = product ? product.attribute_values_id : [];
        const updatedAttributeValuesId = forms.flatMap((form) =>
            form.values
                .filter((value) => value && value.id !== null && value.id !== undefined)
                .map((value) => Number(value.id))
        );

        const finalAttributeValuesId = updatedAttributeValuesId.length > 0 ? updatedAttributeValuesId : currentAttributeValuesId;

        const updatedData = {
            ...prepareProductData(values),
            attribute_values_id: finalAttributeValuesId, // Sử dụng giá trị đã cập nhật hoặc giá trị cũ
            thumbnail: thumbnail ? thumbnail.url : null,
            product_images: images && images.map((img) => img.url), // Chỉ lấy danh sách URL ảnh
            sell_price: values.sell_price || '',
            sale_price: values.sale_price || '',
            slug: values.slug,
            content: values.content,
            category_id: values.category,
            brand_id: values.brand_id,
            name_link: values.name_link,
            is_active: values.is_active,
            sale_price_start_at: values.sale_price_start_at ? dayjs(values.sale_price_start_at).format("YYYY-MM-DD HH:mm:ss") : null,
            sale_price_end_at: values.sale_price_end_at ? dayjs(values.sale_price_end_at).format("YYYY-MM-DD HH:mm:ss") : null,
        };

        console.log("Dữ liệu gửi đi:", updatedData);
        updateProduct(updatedData);

        // Nếu sản phẩm bị tắt kinh doanh, cập nhật tất cả biến thể về trạng thái ngừng kinh doanh
        if (!values.is_active) {
            tableData.forEach((variant) => {
                variant.is_active = 0;
            });
            setTableData([...tableData]);
        }
    };

    // slug tạo tự động
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true, locale: "vi" });
        form.setFieldsValue({ name, slug });
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
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
        setThumbnail(fileList.length > 0 ? fileList[0] : null);
    };

    const onHandleImage = (info) => {
        let { fileList } = info;

        // Nếu tổng số ảnh vượt quá 12, không cho phép upload thêm
        if (fileList.length > 12) {
            // Giữ nguyên danh sách ảnh hiện tại, không cập nhật ảnh mới
            fileList = fileList.slice(0, 12);
        }

        // Nếu upload thành công, cập nhật URL vào danh sách ảnh
        const updatedFileList = fileList.map((file) => {
            if (file.response) {
                return {
                    ...file,
                    url: file.response.secure_url,  // Lấy URL từ response Cloudinary
                    status: 'done',
                };
            }
            return file;
        });

        setImages(updatedFileList);
    };

    // Fetch danh sách thương hiệu
    const { data: brands } = useQuery({
        queryKey: ["brands"],
        queryFn: async () => {
            const response = await BrandsServices.fetchBrands();
            return response.data;
        }
    });

    // danh sách danh mục
    const [categories, setCategories] = useState([]);
    const fetchData = async () => {
        const response = await categoryServices.fetchCategories()
        setCategories(response)
    }
    useEffect(() => {
        fetchData()
    }, [])

    // danh sách thuộc tính
    const { data: attributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: async () => {
            const response = await AttributesServices.fetchAttributes();
            return response.data;
        },
    });

    // tạo thuộc tính mới
    const createAttribute = useMutation({
        mutationFn: async (attribute) => {
            return await AttributesServices.createAttribute(attribute);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributes"]);
            attForm.resetFields();
            setIsAttributeModalOpen(false);
            notification.success({
                message: "Thêm thuộc tính thành công!",
            });
        },
        onError: (error) => {
            notification.error({
                message: "Thêm thuộc tính thất bại!",
                description: error.response?.data?.message || error.message,
            });
        },
    });
    const handleAddAttribute = (values) => {
        createAttribute.mutate(values);
    };

    // danh sách giá trị thuộc tính
    const { data: attributeValue } = useQuery({
        queryKey: ["attributeValue"],
        queryFn: async () => {
            const response = await ValuesServices.fetchValues();
            return response.data;
        },
    });

    // tạo giá trị thuộc tính mới
    const createAttributeVlue = useMutation({
        mutationFn: async (attributeValue) => {
            return await ValuesServices.createValue(attributeValue); // Truyền đúng tham số
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["attributeValue"]);
            valueForm.resetFields();
            setIsValueModalOpen(false);
            notification.success({
                message: "Thêm giá trị thuộc tính thành công!",
            });
        },
        onError: (error) => {
            notification.error({
                message: "Thêm giá trị thuộc tính thất bại!",
                description: error.response?.data?.message || error.message,
            });
        },
    });

    const handleAddValue = (values) => {
        createAttributeVlue.mutate({
            value: values.value,
            attribute_id: values.attribute_id, // Gửi attribute_id
        });
    };

    // hiển thị biến thể ở bảng
    const generateVariants = () => {
        const variants = [];

        const attributesWithValues = forms.filter((form) => form.name && form.values.length > 0);

        if (attributesWithValues.length === 0) {
            notification.warning({
                message: "Vui lòng chọn thuộc tính và giá trị trước khi tạo biến thể.",
            });
            return;
        }

        const generateCombinations = (index, currentVariant) => {
            if (index === attributesWithValues.length) {
                variants.push({
                    ...currentVariant,
                    thumbnail: null,  // Thêm trường thumbnail
                    sell_price: 0,
                    sale_price: 0,
                    fileList: [],     // Thêm trường fileList để quản lý riêng ảnh cho mỗi biến thể
                    key: Date.now() + Math.random(),  // Tạo key duy nhất
                });
                return;
            }

            const attribute = attributesWithValues[index];
            attribute.values.forEach((value) => {
                if (value && value.id !== null && value.id !== undefined) {
                    generateCombinations(index + 1, {
                        ...currentVariant,
                        [attribute.name]: { id: value.id, value: value.value },
                    });
                }
            });
        };

        generateCombinations(0, {});
        setTableData(variants); // Cập nhật dữ liệu biến thể vào bảng
    };

    const prepareProductData = (formValues) => {
        const attributeValuesId = forms.flatMap((form) =>
            form.values
                .filter((value) => value && value.id !== null && value.id !== undefined)
                .map((value) => Number(value.id))
        );

        // Đảm bảo rằng ngày được format theo chuẩn "YYYY-MM-DD HH:mm:ss"
        const formattedStartDate = formValues.sale_price_start_at
            ? dayjs(formValues.sale_price_start_at).format("YYYY-MM-DD HH:mm:ss")
            : null;

        const formattedEndDate = formValues.sale_price_end_at
            ? dayjs(formValues.sale_price_end_at).format("YYYY-MM-DD HH:mm:ss")
            : null;

        return {
            name: formValues.name,
            attribute_values_id: attributeValuesId,
            product_variants: tableData.map((variant) => ({
                attribute_values: Object.values(variant)
                    .filter((attr) => attr?.id !== undefined)
                    .map((attr) => attr.id),
                thumbnail: variant.thumbnail,  // Thêm trường thumbnail vào dữ liệu biến thể
                sell_price: variant.sell_price || '',
                sale_price: variant.sale_price || '',
                sale_price_start_at: variant.sale_price_start_at
                    ? dayjs(variant.sale_price_start_at).format("YYYY-MM-DD HH:mm:ss")
                    : null,
                sale_price_end_at: variant.sale_price_end_at
                    ? dayjs(variant.sale_price_end_at).format("YYYY-MM-DD HH:mm:ss")
                    : null,
            })),
            sale_price_start_at: formattedStartDate, // Đảm bảo định dạng ngày đúng
            sale_price_end_at: formattedEndDate, // Đảm bảo định dạng ngày đúng
        };
    };

    // bảng biến thể
    const columns = [
        ...forms
            .filter((form) => form.name && form.values.length > 0) // Chỉ giữ những thuộc tính có giá trị được chọn
            .map((form) => ({
                title: form.name,
                dataIndex: form.name,
                key: form.name,
                align: "center",
                render: (_, record) => {
                    const attributeValue = record[form.name];
                    return attributeValue?.value || "-"; // Hiển thị "-" nếu không có giá trị
                },
            })),
        {
            title: "Ảnh",
            dataIndex: "thumbnail",
            key: "thumbnail",
            align: "center",
            render: (_, record) => (
                <Form.Item
                    name={`thumbnail_${record.key}`}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    rules={[
                        {
                            validator: (_, value) =>
                                record.thumbnail ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh"),
                        },
                    ]}
                >
                    <Upload
                        className="custom-upload"
                        listType="picture"
                        action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                        data={{ upload_preset: "quangOsuy" }}
                        fileList={record.fileList || []}
                        onChange={(info) => {
                            if (info.file.status === "done" && info.file.response) {
                                const newThumbnailUrl = info.file.response.secure_url;

                                // Cập nhật fileList và thumbnail cho biến thể hiện tại
                                const updatedTableData = tableData.map((item) => {
                                    if (item.key === record.key) {
                                        return {
                                            ...item,
                                            thumbnail: newThumbnailUrl,
                                            fileList: [
                                                {
                                                    uid: info.file.uid,
                                                    name: info.file.name,
                                                    status: "done",
                                                    url: newThumbnailUrl,
                                                },
                                            ],
                                        };
                                    }
                                    return item;
                                });

                                setTableData(updatedTableData); // Cập nhật lại dữ liệu bảng
                            } else if (info.file.status === "removed") {
                                // Xóa ảnh khi người dùng xóa
                                const updatedTableData = tableData.map((item) => {
                                    if (item.key === record.key) {
                                        return {
                                            ...item,
                                            thumbnail: null,
                                            fileList: [],
                                        };
                                    }
                                    return item;
                                });

                                setTableData(updatedTableData);
                            }
                        }}
                        showUploadList={true} // Hiển thị danh sách ảnh
                        onRemove={() => {
                            // Xóa ảnh khỏi fileList
                            const updatedTableData = tableData.map((item) => {
                                if (item.key === record.key) {
                                    return {
                                        ...item,
                                        thumbnail: null,
                                        fileList: [],
                                    };
                                }
                                return item;
                            });
                            setTableData(updatedTableData);
                        }}
                    >
                        {!record.thumbnail && (
                            <Button icon={<UploadOutlined />} type="dashed" className="input-form">
                                Tải ảnh lên
                            </Button>
                        )}
                    </Upload>
                </Form.Item>
            ),
        },
        {
            title: "Giá bán (VNĐ)",
            dataIndex: "sell_price",
            key: "sell_price",
            align: "center",
            render: (_, record, index) => (
                <Form.Item
                    name={["variants", index, "sell_price"]}
                    initialValue={record.sell_price}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const salePrice = getFieldValue(["variants", index, "sale_price"]);
                                if (!value || value > salePrice) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Giá bán phải lớn hơn giá khuyến mại"));
                            },
                        }),
                    ]}
                >
                    <InputNumber
                        className="input-form"
                        min={0}
                        formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                        parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                        onChange={(value) => {
                            const updatedTableData = [...tableData];
                            updatedTableData[index] = { ...record, sell_price: value };
                            setTableData(updatedTableData);
                        }}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Giá khuyến mại (VNĐ)",
            dataIndex: "sale_price",
            key: "sale_price",
            align: "center",
            render: (_, record, index) => (
                <Form.Item
                    name={["variants", index, "sale_price"]}
                    initialValue={record.sale_price}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const sellPrice = getFieldValue(["variants", index, "sell_price"]);
                                if (!value || value < sellPrice) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Giá khuyến mại phải nhỏ hơn giá bán"));
                            },
                        }),
                    ]}
                >
                    <InputNumber
                        className="input-form"
                        min={0}
                        formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                        parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                        onChange={(value) => {
                            const updatedTableData = [...tableData];
                            updatedTableData[index] = { ...record, sale_price: value };
                            setTableData(updatedTableData);
                        }}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Ngày mở KM",
            dataIndex: "sale_price_start_at",
            key: "sale_price_start_at",
            align: "center",
            render: (text, record, index) => (
                <Form.Item
                    name={["variants", index, "sale_price_start_at"]}
                    dependencies={[["variants", index, "sale_price"]]}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const salePrice = getFieldValue(["variants", index, "sale_price"]);
                                if (!salePrice || value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("Vui lòng chọn ngày mở khuyến mại!")
                                );
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        className="input-form"
                        format="DD/MM/YYYY"
                        value={record.sale_price_start_at ? dayjs(record.sale_price_start_at) : null}
                        onChange={(date) => handleDateChange(date, "start", record)}
                        disabledDate={(current) => {
                            return current && current < dayjs().startOf('day'); // Không cho chọn ngày trước hôm nay
                        }}
                    />
                </Form.Item>
            ),
        },
        {
            title: "Ngày đóng KM",
            dataIndex: "sale_price_end_at",
            key: "sale_price_end_at",
            align: "center",
            render: (text, record, index) => (
                <Form.Item
                    name={["variants", index, "sale_price_end_at"]}
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startDateVal = getFieldValue(["variants", index, "sale_price_start_at"]);

                                // Nếu chưa chọn ngày mở => không validate gì cả
                                if (!startDateVal) return Promise.resolve();

                                // Nếu chưa chọn ngày đóng => lỗi required
                                if (!value) return Promise.reject(new Error("Vui lòng chọn ngày đóng khuyến mại"));

                                // Ngày trùng nhau
                                if (value.isSame(startDateVal, 'day')) {
                                    return Promise.reject(new Error('Ngày đóng không được trùng ngày mở'));
                                }

                                // Ngày đóng trước ngày mở
                                if (value.isBefore(startDateVal, 'day')) {
                                    return Promise.reject(new Error('Ngày đóng phải sau ngày mở'));
                                }

                                return Promise.resolve();
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        className="input-form"
                        format="DD/MM/YYYY"
                        value={record.sale_price_end_at ? dayjs(record.sale_price_end_at) : null}
                        onChange={(date) => handleDateChange(date, "end", record)}
                        disabledDate={(current) => {
                            return current && current < dayjs().startOf('day'); // Không cho chọn ngày trước hôm nay
                        }}
                    />
                </Form.Item>
            ),
        },
        {
            title: "",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Tooltip title="Xóa biến thể">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: "Xác nhận xóa",
                                content: "Biến thể sau khi xóa sẽ không thể khôi phục!",
                                okText: "Xóa",
                                cancelText: "Hủy",
                                okButtonProps: { danger: true },
                                onOk: () => {
                                    setTableData(tableData.filter((item) => item !== record)); // Xóa dòng
                                },
                            });
                        }}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="container">
            <h1 className="mb-5">
                <EditOutlined style={{ marginRight: "8px" }} />
                Cập nhật sản phẩm
            </h1>
            <Form
                form={form}
                onFinish={onFinish}
                name="basic"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                labelAlign="top"
                initialValues={{
                    images: images, // Gán danh sách ảnh vào initialValues
                }}
            >
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[
                                { required: true, message: "Vui lòng nhập tên sản phẩm" },
                                { pattern: /^(?!\s+$).+/, message: "Tên không được chứa toàn khoảng trắng" },
                            ]}

                        >
                            <Input
                                className="input-item"
                                onChange={handleNameChange}
                                disabled={product?.total_sales > 0}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Slug"
                            rules={[{ required: true, message: "Vui lòng nhập Slug" }]}
                            name="slug"
                        >
                            <Input
                                className="input-item"
                                disabled={product?.total_sales > 0}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Thương hiệu sản phẩm"
                            name="brand_id"
                            rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
                        >
                            <Select
                                className="input-item"
                                placeholder="Chọn thương hiệu"
                                showSearch
                                disabled={product?.total_sales > 0}
                            >
                                {brands && brands.map((brand) => (
                                    <Option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Danh mục"
                            name="category"
                            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                        >
                            <Select
                                className="input-item"
                                placeholder="Chọn danh mục"
                                showSearch
                                optionFilterProp="children"
                                disabled={product?.total_sales > 0}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {categories.flatMap((category) =>
                                    category.children
                                        .filter((child) => child.parent_id !== null) // Lọc các mục con có parent_id khác null
                                        .map((child) => (
                                            <Option key={child.id} value={child.id}>
                                                {child.name}
                                            </Option>
                                        ))
                                )}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Ảnh bìa"
                            name='thumnail'
                            rules={[
                                {
                                    validator: (_, value) =>
                                        thumbnail ? Promise.resolve() : Promise.reject("Vui lòng tải lên ảnh bìa"),
                                },
                            ]}
                        >
                            <Upload
                                listType="picture"
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{ upload_preset: "quangOsuy" }}
                                fileList={thumbnail ? [thumbnail] : []} // ✅ Hiển thị ảnh đã tải lên
                                onChange={onHandleChange}
                                onRemove={() => setThumbnail(null)}
                            >
                                {!thumbnail && (
                                    <Button icon={<UploadOutlined />} className="btn-item">
                                        Tải ảnh lên
                                    </Button>
                                )}
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái kinh doanh"
                            name="is_active"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>

                    <Col span={16} className="col-item">
                        <Form.Item
                            label="Ảnh sản phẩm"
                            name='images'
                            getValueFromEvent={normFile}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if ((!value || value.length === 0) && images.length === 0) {
                                            return Promise.reject("Vui lòng tải lên ảnh sản phẩm.");
                                        }
                                        if (value.length > 12) {
                                            return Promise.reject("Bạn chỉ có thể tải lên tối đa 12 ảnh.");
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Upload
                                multiple
                                listType="picture-card"
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{ upload_preset: "quangOsuy" }}
                                fileList={images}
                                onChange={onHandleImage}
                                beforeUpload={() => {
                                    if (images.length >= 12) {
                                        return false; // Chặn upload file mới
                                    }
                                    return true; // Cho phép upload
                                }}
                                onRemove={(file) => {
                                    setImages((prev) => prev.filter((img) => img.uid !== file.uid));
                                }}
                            >
                                {images.length < 12 && (
                                    <button className="upload-button" type="button">
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                    </button>
                                )}
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="content"
                        >
                            <ReactQuill
                                theme="snow"
                                style={{ height: "280px", paddingBottom: '50px' }}
                                modules={{
                                    toolbar: [
                                        [{ 'font': [] }],
                                        [{ 'size': ['small', false, 'large', 'huge'] }],
                                        [{ 'color': [] }, { 'background': [] }],
                                        [{ 'align': [] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        ['blockquote', 'code-block'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'image'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    {/* <Col span={8} className="col-item">
                        <Form.Item label="Loại sản phẩm">
                            <Radio.Group
                                className="radio-group"
                                value={productType}
                                onChange={(e) => setProductType(e.target.value)}
                                options={[
                                    { label: "Sản phẩm đơn", value: "single" },
                                    { label: "Sản phẩm có biến thể", value: "variant" },
                                ]}
                            />
                        </Form.Item>
                    </Col> */}

                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Giá bán (VNĐ)"
                            name="sell_price"
                            dependencies={["sale_price"]}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const salePrice = getFieldValue("sale_price");
                                        if (!value || !salePrice || value > salePrice) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Giá bán phải lớn hơn giá khuyến mại!"));
                                    }
                                })
                            ]}
                        >
                            <InputNumber
                                className="input-item"
                                formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                                parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                            />
                        </Form.Item>

                        <Form.Item
                            label="Ngày mở khuyến mại"
                            name="sale_price_start_at"
                            dependencies={["sale_price"]}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const salePrice = getFieldValue("sale_price");
                                        if (!salePrice || value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Vui lòng chọn ngày mở khuyến mại!")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                value={product?.sale_price_start_at ? dayjs(product.sale_price_start_at) : null}  // Dùng dayjs để chuyển đổi giá trị ngày
                                onChange={handleDateChange}  // Hàm xử lý khi thay đổi ngày
                                className="input-item"
                                format="DD/MM/YYYY"  // Định dạng ngày hiển thị
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf('day'); // Không cho chọn ngày trước hôm nay
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Giá khuyến mại (VNĐ)"
                            name="sale_price"
                            dependencies={["sell_price"]}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const sellPrice = getFieldValue("sell_price");
                                        if (!value || !sellPrice || value < sellPrice) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Giá khuyến mại phải nhỏ hơn giá bán!"));
                                    }
                                })
                            ]}
                        >
                            <InputNumber
                                className="input-item"
                                formatter={value => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} // Thêm dấu chấm
                                parser={value => value?.replace(/\./g, "")} // Xóa dấu chấm khi nhập vào
                            />
                        </Form.Item>

                        <Form.Item
                            label="Ngày đóng khuyến mại"
                            name="sale_price_end_at"
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startDate = getFieldValue('sale_price_start_at');

                                        // Nếu chưa chọn ngày mở => không validate gì cả
                                        if (!startDate) return Promise.resolve();

                                        // Nếu chưa chọn ngày đóng => lỗi required
                                        if (!value) return Promise.reject(new Error("Vui lòng chọn ngày đóng khuyến mại"));

                                        // Ngày trùng nhau
                                        if (value.isSame(startDate, 'day')) {
                                            return Promise.reject(new Error('Ngày đóng không được trùng ngày mở'));
                                        }

                                        // Ngày đóng trước ngày mở
                                        if (value.isBefore(startDate, 'day')) {
                                            return Promise.reject(new Error('Ngày đóng phải sau ngày mở'));
                                        }

                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                value={product?.sale_price_end_at ? dayjs(product.sale_price_end_at) : null}  // Dùng dayjs để chuyển đổi giá trị ngày
                                onChange={handleDateChange}  // Hàm xử lý khi thay đổi ngày
                                className="input-item"
                                format="DD/MM/YYYY"  // Định dạng ngày hiển thịnh dạng ngày hiển thị
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf('day'); // Không cho chọn ngày trước hôm nay
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <hr />
                <h1 className="mb-5">
                    <BarsOutlined style={{ marginRight: "8px" }} />
                    Thuộc tính
                </h1>

                {attributes && attributes.length > 0 ? (
                    // Chia attributes thành các nhóm, mỗi nhóm 3 thuộc tính
                    attributes
                        .sort((a, b) => a.id - b.id)
                        .reduce((rows, attr, index) => {
                            if (index % 3 === 0) rows.push([]);
                            rows[rows.length - 1].push(attr);
                            return rows;
                        }, [])
                        .map((row, rowIndex) => (
                            <Row key={rowIndex} gutter={24} style={{ marginBottom: "16px" }}>
                                {row.map((attr) => (
                                    <Col key={attr.id} span={8}>
                                        <div className="attribute-container">
                                            <label className="attr-name">{attr.name}</label>
                                            <div className="attribute">
                                                <Select
                                                    mode="multiple"
                                                    className="input-item"
                                                    placeholder={`Chọn giá trị cho ${attr.name}`}
                                                    onChange={(values) => {
                                                        // Chỉ thêm thuộc tính vào danh sách nếu có giá trị được chọn
                                                        const updatedForms = [...forms];
                                                        const existingIndex = updatedForms.findIndex(f => f.id === attr.id);

                                                        if (values.length > 0) {
                                                            if (existingIndex === -1) {
                                                                updatedForms.push({
                                                                    id: attr.id,
                                                                    name: attr.name,
                                                                    values: values.map(value => ({
                                                                        id: Number(value),
                                                                        value: attributeValue?.find(val => val.id === Number(value))?.value || ""
                                                                    })),
                                                                });
                                                            } else {
                                                                updatedForms[existingIndex].values = values.map(value => ({
                                                                    id: Number(value),
                                                                    value: attributeValue?.find(val => val.id === Number(value))?.value || ""
                                                                }));
                                                            }
                                                        } else {
                                                            // Xóa thuộc tính khỏi danh sách nếu không có giá trị nào được chọn
                                                            if (existingIndex !== -1) {
                                                                updatedForms.splice(existingIndex, 1);
                                                            }
                                                        }

                                                        setForms(updatedForms);
                                                    }}
                                                    value={forms.find(f => f.id === attr.id)?.values.map(v => v.id) || []}
                                                >
                                                    {attributeValue ? (
                                                        attributeValue
                                                            .filter(val => val.attribute_id === attr.id)
                                                            .map(val => (
                                                                <Option key={val.id} value={val.id}>
                                                                    {val.value}
                                                                </Option>
                                                            ))
                                                    ) : (
                                                        <Option disabled>Đang tải...</Option>
                                                    )}
                                                </Select>

                                                <Tooltip title='Thêm giá trị mới'>
                                                    <Button
                                                        color="primary"
                                                        variant="outlined"
                                                        className="btn-item"
                                                        icon={<PlusOutlined />}
                                                        onClick={() => setIsValueModalOpen(true)} // Mở modal tạo giá trị thuộc tính mới
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        ))
                ) : (
                    <p>Không có thuộc tính nào để hiển thị.</p>
                )}

                <Button
                    color="primary" variant="outlined" className="btn-item"
                    onClick={() => setIsAttributeModalOpen(true)}
                >
                    Thêm thuộc tính
                </Button>
                <Button type="primary" className="btn-item" onClick={generateVariants}>Tạo biến thể</Button>

                <hr />
                <h1 className="mb-5">
                    <InsertRowLeftOutlined style={{ marginRight: "8px" }} />
                    Danh sách sản phẩm cùng loại
                </h1>
                <Table columns={columns} dataSource={tableData} rowKey="id" />

                <Modal
                    title="Tạo thuộc tính mới"
                    visible={isAttributeModalOpen}
                    onCancel={() => setIsAttributeModalOpen(false)}
                    footer={null}
                >
                    <Form
                        form={attForm}
                        layout="vertical"
                        onFinish={(values) => handleAddAttribute(values)}
                    >
                        <Form.Item
                            label="Tên thuộc tính"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập tên thuộc tính!" }]}
                        >
                            <Input placeholder="Nhập tên thuộc tính" className="input-item" />
                        </Form.Item>
                        <div className="add">
                            <Button type="primary" htmlType="submit">
                                Tạo
                            </Button>
                        </div>
                    </Form>
                </Modal>

                <Modal
                    title="Tạo giá trị thuộc tính mới"
                    visible={isValueModalOpen}
                    onCancel={() => setIsValueModalOpen(false)}
                    footer={null}
                >
                    <Form
                        form={valueForm}
                        layout="vertical"
                        onFinish={(values) => handleAddValue(values)}
                    >
                        <Form.Item
                            label="Tên giá trị"
                            name="value"
                            rules={[{ required: true, message: "Vui lòng nhập tên giá trị!" }]}
                        >
                            <Input placeholder="Nhập tên giá trị" className="input-item" />
                        </Form.Item>

                        <Form.Item
                            label="Thuộc tính"
                            name="attribute_id"
                            rules={[{ required: true, message: "Vui lòng chọn thuộc tính!" }]}
                        >
                            <Select
                                className="input-attribute"
                                allowClear
                                placeholder="Chọn thuộc tính"
                                onChange={(value) => setSelectedAttributeId(value)}
                            >
                                {attributes && attributes.map((attr) => (
                                    <Option key={attr.id} value={attr.id}>
                                        {attr.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <div className="add">
                            <Button type="primary" htmlType="submit">
                                Tạo
                            </Button>
                        </div>
                    </Form>
                </Modal>

                <div className="add">
                    <Button htmlType="submit" type="primary" className="btn-item">
                        Cập nhật
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Edit;