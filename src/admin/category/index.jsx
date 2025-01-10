import React, { useEffect, useState } from 'react'
import { Button, Table, Modal } from "antd";
import { categoryServices } from './../../services/categories';
import { PlusOutlined } from '@ant-design/icons';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import categorySchema from './../../schemas/categorySchema';
import formatDate from '../../utils/formatDate';

const Categories = () => {
    const [categories, setCategories] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false);



    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(categorySchema),
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Ordinal',
            dataIndex: 'ordinal',
            key: 'ordinal',
        },
        {
            title: 'Active',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive) => (<span
                className={`px-2 py-1 rounded border ${isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-red-500 text-red-600'
                    }`}
            >
                {isActive ? 'Active' : 'Inactive'}
            </span>),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (createdAt) => formatDate(createdAt),
        },
    ];


    const handleShowCreate = () => {
        setIsModalVisible(true);
    }
    const handleCancel = () => {
        setIsModalVisible(false);
        reset();
    }

    const getParentCategoryName = (parentId) => {
        console.log(parentId);

        if (!parentId) return "Không có danh mục cha";
        const parent = categories.find(cat => cat.id === Number(parentId));
        return parent ? parent.name : "Không xác định";
    };

    const onSubmit = async (data) => {
        const payload = {
            name: data.name,
            parent_id: Number(data.parentId),
            slug: data.slug,
            ordinal: Number(data.ordinal)
        }

        const response = await categoryServices.createCategory(payload)
        if (response) {
            setCategories([...categories, response])
        }
        setIsModalVisible(false);
        reset();
    }

    const fetchData = async () => {
        const response = await categoryServices.fetchCategories()
        setCategories(response)
    }
    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <h2 className="text-2xl font-semibold mb-4">Danh sách danh mục</h2>
            <Button
                onClick={() => handleShowCreate()}
                type="primary"
                className='mb-2'
            >
                Create
            </Button>
            <Modal
                title="Thêm Danh mục"
                visible={isModalVisible}
                onCancel={handleCancel}
                width={600}
                footer={null}
            >
                {isModalVisible && (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 ">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Tên danh mục</label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className={`w-full p-2  rounded-md ${errors.name?.message ? " border border-red-500 outline-red-300 " : "border border-gray-300"
                                        }`}
                                    placeholder="Nhập tên danh mục"
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Slug</label>
                                <input
                                    type="text"
                                    {...register("slug")}
                                    className={`w-full p-2  rounded-md ${errors.slug?.message ? " border border-red-500 outline-red-300 " : "border border-gray-300"
                                        }`}
                                    placeholder="Nhập tên danh mục"
                                />
                                {errors.slug && (
                                    <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Danh mục cha</label>
                                <select
                                    {...register("parentId")}
                                    className={`w-full p-2 border rounded-md ${errors.parentId ? "border-red-500" : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Chọn danh mục cha</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.parentId && (
                                    <p className="text-xs text-red-500 mt-1">{errors.parentId.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Thứ tự hiển thị</label>
                                <select
                                    {...register("ordinal")}
                                    className={`w-full p-2 rounded-md ${errors.ordinal ? "border border-red-500 outline-red-300" : "border border-gray-300"}`}
                                >
                                    <option value="">Chọn thứ tự</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                                {errors.ordinal && <p className="text-xs text-red-500 mt-1">{errors.ordinal.message}</p>}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"

                                >
                                    Thêm danh mục
                                </button>
                            </div>
                        </form>

                    </>)}
            </Modal>

            <Table dataSource={categories} columns={columns} rowKey="id"
                pagination={false}
                expandable={{
                    childrenColumnName: 'children',
                }} />
        </>
    )
}

export default Categories