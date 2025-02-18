import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, InputNumber, Form, notification, Row, Col, Upload, Radio, Switch, Tooltip, DatePicker } from "antd";
import { DeleteOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TextArea from "antd/es/input/TextArea";
import slugify from "slugify";
import "./add.css";
import { productsServices } from './../../services/product';
import { BrandsServices } from './../../services/brands';
import { categoryServices } from './../../services/categories';
import { AttributesServices } from './../../services/attributes';
import { ValuesServices } from './../../services/attribute_value';
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
    const [filteredValues, setFilteredValues] = useState([]); // Lưu giá trị thuộc tính được lọc
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
            navigate("/list-pr");
        },
        onError: (error) => {
            notification.error({
                message: "Cập nhật sản phẩm thất bại",
                description: error.response?.data?.message || error.message,
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
        
        // Kiểm tra nếu giá khuyến mại cao hơn hoặc bằng giá bán
        if (values.sale_price && values.sell_price && parseFloat(values.sale_price) >= parseFloat(values.sell_price)) {
            notification.error({
                message: "Lỗi nhập liệu",
                description: "Giá khuyến mại không thể cao hơn hoặc bằng giá bán!",
            });
            return; // Dừng lại không gửi dữ liệu
        }
        
        const updatedData = {
            ...prepareProductData(values),
            thumbnail: thumbnail ? thumbnail.url : null,
            product_images: images && images.map((img) => img.url), // Chỉ lấy danh sách URL ảnh
            sell_price: values.sell_price,
            sale_price: values.sale_price,
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
        const { fileList } = info;

        // Nếu tổng số ảnh vượt quá 6, không cho phép upload thêm
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
    
        // Cập nhật danh sách ảnh trong state
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
        ...forms.map((form) => ({
            title: form.name, // Tên cột là tên thuộc tính
            dataIndex: form.name,
            key: form.name,
            align: "center",
            render: (_, record) => {
                // Hiển thị value nếu tồn tại
                const attributeValue = record[form.name];
                return attributeValue?.value; // Lấy giá trị value
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
            <h1 className="mb-5">Cập nhật sản phẩm</h1>
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
                            rules={[{ required: true, message: "Vui lòng chọn thương hiệu" }]}
                        >
                            <Select 
                                className="input-item"
                                placeholder="Chọn thương hiệu"
                                showSearch
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
                    </Col>

                    <Col span={16} className="col-item">
                        <Form.Item 
                            label="Ảnh sản phẩm"
                            name='images'
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
                                        <PlusOutlined />
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
                            valuePropName="checked"
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
                    
                    {/* Điều kiện hiển thị cho giá bán khi là sản phẩm đơn */}
                    {productType === "single" && (
                        <>
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
                                        value={product?.sale_price_start_at ? dayjs(product.sale_price_start_at) : null}  // Dùng dayjs để chuyển đổi giá trị ngày
                                        onChange={handleDateChange}  // Hàm xử lý khi thay đổi ngày
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
                                        value={product?.sale_price_end_at ? dayjs(product.sale_price_end_at) : null}  // Dùng dayjs để chuyển đổi giá trị ngày
                                        onChange={handleDateChange}  // Hàm xử lý khi thay đổi ngày
                                        className="input-item"
                                        format="DD-MM-YY"  // Định dạng ngày hiển thịnh dạng ngày hiển thị
                                    />
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>

                {productType === "variant" && (
                    <>
                        <hr />
                        <h2>Thuộc tính</h2>
                        {forms.map((form, index) => (
                            <div key={form.id} className="attribute">
                                <Select
                                    className="input-attribute"
                                    allowClear
                                    showSearch
                                    placeholder="Chọn thuộc tính"
                                    value={form.name || undefined}
                                    onChange={(value) => {
                                        const isAlreadySelected = forms.some((f, i) => f.name === value && i !== index);
                                        if (isAlreadySelected) {
                                            notification.warning({
                                                message: "Thuộc tính này đã được chọn trước đó!",
                                            });
                                            return;
                                        }
                                        forms[index].name = value;
                                        setForms([...forms]);
                                        const selectedAttribute = attributes.find(attr => attr.name === value);
                                        const valuesForAttribute = attributeValue.filter(
                                            val => val.attribute_id === selectedAttribute.id
                                        );
                                        setFilteredValues(valuesForAttribute);
                                    }}
                                >
                                    {attributes && attributes.map((attr) => (
                                        <Option key={attr.id} value={attr.name}>
                                            {attr.name}
                                        </Option>
                                    ))}
                                </Select>
                            
                                <Button 
                                    color="primary" 
                                    variant="outlined"
                                    className="btn-item" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => setIsAttributeModalOpen(true)} // Mở modal tạo thuộc tính mới
                                >
                                </Button>
                            
                                <Select
                                    mode="multiple"
                                    className="input-attribute"
                                    allowClear
                                    placeholder="Chọn giá trị"
                                    onChange={(values) => {
                                        if (values.includes("create_value")) {
                                            setIsValueModalOpen(true);
                                            const filteredValues = values.filter((value) => value !== "create_value");
                                            forms[index].values = filteredValues.map((value) => ({
                                                id: Number(value),
                                                value: filteredValues.find((val) => val.id === Number(value))?.value || "",
                                            }));
                                        } else {
                                            forms[index].values = values.map((value) => ({
                                                id: Number(value),
                                                value: filteredValues.find((val) => val.id === Number(value))?.value || "",
                                            }));
                                        }
                                        setForms([...forms]); // Cập nhật forms
                                    }}
                                >
                                    {filteredValues.map((val) => (
                                        <Option key={val.id} value={val.id}>
                                            {val.value}
                                        </Option>
                                    ))}
                                </Select>
        
                                <Button 
                                    color="primary" 
                                    variant="outlined"
                                    className="btn-item" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => setIsValueModalOpen(true)} // Mở modal tạo giá trị thuộc tính mới
                                >
                                </Button>
                            </div>
                        ))}

                        <Button 
                            color="primary" variant="outlined" className="btn-item" 
                            onClick={() => setForms([...forms, { id: Date.now(), name: "", values: [] }])}
                        >
                            Thêm thuộc tính
                        </Button>
                        <Button type="primary" className="btn-item" onClick={generateVariants}>Tạo biến thể</Button>

                        <hr />
                        <h2>Danh sách sản phẩm cùng loại</h2>
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