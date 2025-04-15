import { CommentOutlined, StarFilled } from "@ant-design/icons";
import React, { useState } from "react";
import formatDate from "../../utils/formatDate";
import { Table, Spin, Typography, Button, Select, message, Skeleton, Image } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentServices } from "../../services/comment";

const { Text } = Typography;
const { Option } = Select;

const Comment = () => {
  const queryClient = useQueryClient();
  const [selectedComments, setSelectedComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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
      dataIndex: "index",
      align: "center",
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
    },  
    {
      title: "Sản phẩm",
      dataIndex: "products_id",
      key: "products_id",
      align: "center",
    },
    {
      title: "Nội dung",
      dataIndex: "comments",
      key: "comments",
      align: "center",
    },
    {
      title: "Parent Id",
      dataIndex: "parent_id",
      key: "parent_id",
      align: "center",
      render: (parentId) => (parentId ? parentId : "N/A"),
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (image) => <Image width={90} src={image} />,
        // image ? <img src={image} width={50} height={50} alt="Comment" /> : "N/A",
    },
    {
      title: "Đánh giá sao",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      render: (rating) => (
        <span>
          {rating} <StarFilled />
        </span>
      ),
    },
    {
      title: "Ngày đăng",
      dataIndex: "created_at",
      key: "created_at",
      align: "center",
      render: (createdAt) => (createdAt ? formatDate(createdAt) : "N/A"),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: "center",
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
  ];

  if (error) {
    return <Text type="danger">Không thể tải dữ liệu. Vui lòng thử lại!</Text>;
  }

  return (
    <>
      <h1 className="mb-5">
        <CommentOutlined style={{ marginRight: "8px" }} />
        Danh sách bình luận
      </h1>

      <div className='group1'>
        <Button type="primary" onClick={() => handleBulkUpdate("approve")} disabled={selectedComments.length === 0}>
          Duyệt tất cả đã chọn
        </Button>
        <Button color="danger" variant="solid" onClick={() => handleBulkUpdate("hide")} disabled={selectedComments.length === 0}>
          Ẩn tất cả đã chọn
        </Button>
      </div>

      <Skeleton active loading={isLoading}>
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
          pagination={{ pageSize: 10, current: currentPage }}
          onChange={(pagination) => setCurrentPage(pagination.current)}
        />
      </Skeleton>
    </>
  );
};

export default Comment;
