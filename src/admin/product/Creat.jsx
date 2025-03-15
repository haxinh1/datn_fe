import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, Form, notification, Row, Col, Upload, Radio, InputNumber, Switch, Tooltip, DatePicker } from "antd";
import { DeleteOutlined, PlusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import slugify from "slugify";
import { productsServices } from './../../services/product';
import { BrandsServices } from './../../services/brands';
import { categoryServices } from './../../services/categories';
import { AttributesServices } from './../../services/attributes';
import { ValuesServices } from './../../services/attribute_value';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../css/add.css";

const { Option } = Select;

const Creat = () => {
    const queryClient = useQueryClient(); 
    const [forms, setForms] = useState([{ id: Date.now(), name: "", values: [] }]);
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [logo, setLogo] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [valueForm] = Form.useForm();
    const [attForm] = Form.useForm();
    const [brandForm] = Form.useForm();
    const [thumbnail, setThumbnail] = useState(null);
    const [images, setImages] = useState([]);
    const [productType, setProductType] = useState("single");
    const [selectedAttributeId, setSelectedAttributeId] = useState(null);
    const [tableData, setTableData] = useState([]); // Dữ liệu bảng
    const navigate = useNavigate()
    const [selectedDate, setSelectedDate] = useState(null);
    
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

    // Thêm sản phẩm
    const { mutate } = useMutation({
        mutationFn: async (product) => {
            try {
                const response = await productsServices.createProduct(product);
                return response
            } catch (error) {
                throw new Error(error.response?.data?.message || "Đã xảy ra lỗi khi thêm sản phẩm.");
            }
        },
        onSuccess: () => {
            form.resetFields();
            notification.success({
                message: "Thêm sản phẩm thành công!",
                description: "Sản phẩm mới đã được thêm vào danh sách.",
            });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            navigate("/admin/import");
        },
        onError: (error) => {
            notification.error({
                message: "Thêm sản phẩm thất bại",
                description: error.message,
            });
        },
    });

    const onFinish = (values) => {
        // Kiểm tra nếu giá khuyến mại của biến thể lớn hơn hoặc bằng giá bán
        const invalidVariants = tableData.filter(variant => 
            variant.sale_price >= variant.sell_price
        );
    
        if (invalidVariants.length > 0) {
            notification.error({
                message: "Lỗi nhập liệu",
                description: "Có biến thể có giá khuyến mại lớn hơn hoặc bằng giá bán! Vui lòng kiểm tra lại.",
            });
            return; // Dừng lại không gửi dữ liệu
        }
    
        // Kiểm tra giá sản phẩm đơn
        if (values.sale_price && values.sell_price && parseFloat(values.sale_price) >= parseFloat(values.sell_price)) {
            notification.error({
                message: "Lỗi nhập liệu",
                description: "Giá khuyến mại không thể cao hơn hoặc bằng giá bán!",
            });
            return; // Dừng lại không gửi dữ liệu
        }
        
        // Chuẩn bị dữ liệu trước khi gửi
        const productData = prepareProductData(values);
        
        const finalData = {
            ...productData,
            thumbnail, 
            product_images: images.map((img) => img.url),
            sell_price: values.sell_price,
            sale_price: values.sale_price,
            slug: values.slug, 
            content: values.content,
            category_id: values.category, 
            brand_id: values.brand_id,
            name_link: values.name_link,
            is_active: values.is_active ? 1 : 0,  
            sale_price_start_at: productData.sale_price_start_at,
            sale_price_end_at: productData.sale_price_end_at,
        };
    
        console.log("Dữ liệu gửi đi:", finalData); // Log để kiểm tra
        mutate(finalData); // Gửi dữ liệu tới API
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
        if (info.file.status === "done" && info.file.response) {
            setThumbnail(info.file.response.secure_url);
        } else if (info.file.status === "removed") {
            setThumbnail(null); // Đặt lại thumbnail về null khi ảnh bị xóa
        }
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
                    url: file.response.secure_url, // Lấy URL từ response Cloudinary
                    status: "done",
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

    // Tạo thương hiệu mới
    const addBrandMutation = useMutation({
        mutationFn: async (brand) => {
            return await BrandsServices.createBrand(brand);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["brands"]);
            brandForm.resetFields(); // Reset form
            setIsModalVisible(false); // Đóng modal
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
    
    const onHandleBrand = (info) => {
        if (info.file.status === "done" && info.file.response) {
            setLogo(info.file.response.secure_url);
        } 
    };

    const handleAddBrand = (values) => {
        const brandData = { 
            name: values.brand_name, 
            slug: values.brand_slug, 
            logo 
        };
    
        // Gọi API thêm thương hiệu
        addBrandMutation.mutate(brandData);
    };

    const handleNameBrand = (e) => {
        const brand_name = e.target.value;
        const brand_slug = slugify(brand_name, { lower: true, strict: true, locale: "vi" });
        brandForm.setFieldsValue({ brand_name, brand_slug });
    };

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
                thumbnail: variant.thumbnail, 
                sell_price: variant.sell_price,  
                sale_price: variant.sale_price, 
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
            width: 300,
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
                    initialValue={record.sale_price}
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
            render: (text, record) => (
                <DatePicker
                    format="DD-MM-YYYY"
                    value={record.sale_price_start_at ? dayjs(record.sale_price_start_at) : null}
                    onChange={(date) => handleDateChange(date, "start", record)}
                />
            ),
        },
        {
            title: "Ngày đóng KM",
            dataIndex: "sale_price_end_at",
            key: "sale_price_end_at",
            align: "center",
            render: (text, record) => (
                <DatePicker
                    format="DD-MM-YYYY"
                    value={record.sale_price_end_at ? dayjs(record.sale_price_end_at) : null}
                    onChange={(date) => handleDateChange(date, "end", record)}
                />
            ),
        },                     
        {
            title: "Thao tác",
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
                <PlusCircleOutlined style={{ marginRight: "8px" }} />
                Thêm sản phẩm mới
            </h1>
            <Form 
                form={form} 
                onFinish={onFinish}
                name="basic"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                labelAlign="top"
            >
                <Row gutter={24}>
                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Tên sản phẩm"
                            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                            name="name"
                        >
                            <Input className="input-item" onChange={handleNameChange} />
                        </Form.Item>

                        <Form.Item
                            label="Slug"
                            rules={[{ required: true, message: "Vui lòng nhập Slug" }]}
                            name="slug"
                        >
                            <Input className="input-item" />
                        </Form.Item>

                        <Form.Item
                            label="Thương hiệu sản phẩm"
                            name="brand_id"
                            rules={[{ required: true, message: "Vui lòng chọn thương hiệu"}]}
                        >
                            <div className="attribute">
                                <Select 
                                    className="input-item"
                                    placeholder="Chọn thương hiệu"
                                    showSearch
                                    onChange={(value) => {
                                        form.setFieldsValue({ brand_id: value });  // Cập nhật giá trị brand_id vào form
                                    }}
                                >
                                    {brands && brands.map((brand) => (
                                        <Option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </Option>
                                    ))}
                                </Select>

                                <Tooltip title='Thêm thương hiệu mới'>
                                    <Button 
                                        className="btn-import"
                                        color="primary" 
                                        variant="outlined"
                                        icon={<PlusOutlined />}
                                        onClick={setIsModalVisible}
                                    />   
                                </Tooltip>
                            </div>
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
                            name='thumbnail'
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
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
                                onChange={onHandleChange}
                                showUploadList={true} // Hiển thị danh sách ảnh đã tải lên
                                fileList={thumbnail ? [{ url: thumbnail }] : []} // Nếu thumbnail có giá trị thì hiển thị ảnh
                                onRemove={() => setThumbnail(null)} // Đặt lại thumbnail khi ảnh bị xóa
                            >
                                {!thumbnail && (
                                    <Button icon={<UploadOutlined />} className="btn-item">
                                        Tải ảnh lên
                                    </Button>
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>

                    <Col span={16} className="col-item">
                        <Form.Item
                            label="Ảnh sản phẩm"
                            name="images"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || value.length === 0) {
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
                                fileList={images}  // Hiển thị danh sách ảnh hiện tại
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
                                {images.length < 12 && ( // Ẩn nút tải lên nếu đã có 6 ảnh
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

                        <Form.Item 
                            label="Trạng thái kinh doanh" 
                            name="is_active" 
                            initialValue={true}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={8} className="col-item">
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
                    </Col>
                    <Col span={8} className="col-item">
                        <Form.Item
                            label="Giá bán (VNĐ)"
                            name="sell_price"
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
                        >
                            <DatePicker 
                                value={selectedDate ? dayjs(selectedDate) : null}  // Đảm bảo sử dụng dayjs để chuyển chuỗi thành đối tượng dayjs
                                onChange={handleDateChange}  // Truyền hàm handleDateChange vào đây
                                className="input-item"
                                format="DD-MM-YY"  // Định dạng ngày hiển thị
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
                        >
                            <DatePicker 
                                value={selectedDate ? dayjs(selectedDate) : null}  // Đảm bảo sử dụng dayjs để chuyển chuỗi thành đối tượng dayjs
                                onChange={handleDateChange}  // Truyền hàm handleDateChange vào đây
                                className="input-item"
                                format="DD-MM-YY"  // Định dạng ngày hiển thị
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {productType === "variant" && (
                    <>
                        <hr />
                        <h1 className="mb-5">Thuộc tính</h1>
                        {attributes && attributes
                            .sort((a, b) => a.id - b.id)
                            .map((attr) => (
                            <div key={attr.id}>
                                <label className="attr-name">{attr.name}</label>
                                <div className="attribute">
                                    <Select
                                        mode="multiple"
                                        className="input-attribute"
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
                                                updatedForms.splice(existingIndex, 1);
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
                        ))}

                        <Button 
                            color="primary" variant="outlined" className="btn-item" 
                            onClick={() => setIsAttributeModalOpen(true)}
                        >
                            Thêm thuộc tính
                        </Button>
                        <Button type="primary" className="btn-item" onClick={generateVariants}>Tạo biến thể</Button>

                        <hr />
                        <h1 className="mb-5">Danh sách sản phẩm cùng loại</h1>
                        <Table columns={columns} dataSource={tableData} rowKey="id" />
                    </>
                )}

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
                        <Row gutter={24}>
                            <Col span={12} className="col-item">
                                <Form.Item
                                    label="Tên giá trị"
                                    name="value"
                                    rules={[{ required: true, message: "Vui lòng nhập tên giá trị!" }]}
                                >
                                    <Input placeholder="Nhập tên giá trị" className="input-item" />
                                </Form.Item>
                            </Col>
                            <Col span={12} className="col-item">
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
                            </Col>
                        </Row>

                        <div className="add">
                            <Button type="primary" htmlType="submit">
                                Tạo
                            </Button>
                        </div>
                    </Form>
                </Modal>    

                <Modal
                    title="Tạo thương hiệu mới"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={brandForm}
                        layout="vertical"
                        onFinish={handleAddBrand}
                    >      
                        <Row gutter={24}>
                            <Col span={12} className="col-item">
                                <Form.Item
                                    label="Tên thương hiệu"
                                    name="brand_name"
                                    rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
                                >
                                    <Input className="input-item" onChange={handleNameBrand} />
                                </Form.Item>
                            </Col>
                            <Col span={12} className="col-item">
                                <Form.Item
                                    label="Slug"
                                    name="brand_slug"
                                    rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                                >
                                    <Input className="input-item" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item 
                            label="Logo thương hiệu" 
                            name="logo"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload 
                                listType="picture" 
                                action="https://api.cloudinary.com/v1_1/dzpr0epks/image/upload"
                                data={{ upload_preset: "quangOsuy" }}
                                onChange={onHandleBrand}
                                showUploadList={true} // Hiển thị danh sách ảnh đã tải lên
                                fileList={logo ? [{ url: logo }] : []}
                            >
                                {!logo && (
                                    <Button icon={<UploadOutlined />} className="btn-item">
                                        Tải ảnh lên
                                    </Button>
                                )}
                            </Upload>
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
                        Thêm sản phẩm
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Creat;