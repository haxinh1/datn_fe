import { BookOutlined, StarFilled } from "@ant-design/icons";
import React, { useState } from "react";
import formatDate from "../../utils/formatDate";
import { Table, Spin, Typography, Button, Select, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentServices } from "../../services/comment";

const { Text } = Typography;
const { Option } = Select;

const Comment = () => {
  const queryClient = useQueryClient();
  const [selectedComments, setSelectedComments] = useState([]);

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ["comments"],
    queryFn: CommentServices.fetchComments,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => CommentServices.updateComment(id, { status }),
    onSuccess: () => {
      message.success("Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: () => {
      message.error("Cập nhật thất bại, vui lòng thử lại!");
    },
  });



  const handleUpdateComment = (id, status) => {
    updateMutation.mutate({ id, status });
  };

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ comment_ids, action }) => CommentServices.bulkAction({ comment_ids, action }),
    onSuccess: () => {
      message.success("Cập nhật trạng thái hàng loạt thành công!");
      queryClient.invalidateQueries(["comments"]);
      setSelectedComments([]);
    },
    onError: () => {
      message.error("Cập nhật thất bại, vui lòng thử lại!");
    },
  });

  const handleSelectChange = (selectedRowKeys) => {
    setSelectedComments(selectedRowKeys);
  };

  const handleBulkUpdate = (action) => {
    if (selectedComments.length === 0) {
      message.warning("Vui lòng chọn ít nhất một bình luận!");
      return;
    }
    bulkUpdateMutation.mutate({ comment_ids: selectedComments, action });
  };




  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Products Id",
      dataIndex: "products_id",
      key: "products_id",
    },
    {
      title: "Comment",
      dataIndex: "comments",
      key: "comments",
    },
    {
      title: "Parent Id",
      dataIndex: "parent_id",
      key: "parent_id",
      render: (parentId) => (parentId ? parentId : "N/A"),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image ? <img src={image} width={50} height={50} alt="Comment" /> : "N/A",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <span>
          {rating} <StarFilled />
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          defaultValue={status}
          style={{ width: 120 }}
          onChange={(value) => handleUpdateComment(record.id, value)}
        >
          {status !== 1 && status !== 2 && <Option value={0}>Chờ duyệt</Option>}
          <Option value={1}>Đã duyệt</Option>
          <Option value={2}>Đã ẩn</Option>
        </Select>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (createdAt) => (createdAt ? formatDate(createdAt) : "N/A"),
    },
  ];

  if (isLoading) {
    return <Spin tip="Đang tải dữ liệu..." className="flex justify-center mt-5" />;
  }

  if (error) {
    return <Text type="danger">Không thể tải dữ liệu. Vui lòng thử lại!</Text>;
  }

  return (
    <>
      <h1 className="mb-5">
        <BookOutlined style={{ marginRight: "8px" }} />
        Danh sách bình luận
      </h1>

      <div className="mb-4 flex gap-2">
        <Button type="primary" onClick={() => handleBulkUpdate("approve")} disabled={selectedComments.length === 0}>
          Duyệt tất cả đã chọn
        </Button>
        <Button color="danger" variant="solid" onClick={() => handleBulkUpdate("hide")} disabled={selectedComments.length === 0}>
          Ẩn tất cả đã chọn
        </Button>
      </div>
      <Table
        className="custom-table"
        dataSource={comments || []}
        columns={columns}
        rowKey="id"
        rowSelection={{
          selectedRowKeys: selectedComments,
          onChange: handleSelectChange,
        }}
        expandable={{ childrenColumnName: "children" }}
      />
    </>
  );
};

export default Comment;
