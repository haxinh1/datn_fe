import instance from "../axios"

const fetchComments = async () => {
    try {
        const { data } = await instance.get('/comments')
        return data.data
    } catch (error) {
        console.log(error)
    }
}
const createComment = async (payload) => {
    try {
        const { data } = await instance.post('/comments', payload)
        return data
    } catch (error) {
        console.log(error)
    }
}
const updateComment = async (id, payload) => {
    try {
        const { data } = await instance.put(`/comments/${id}`, payload)
        return data
    } catch (error) {
        console.log(error)
    }
}

const bulkAction = async ({ comment_ids, action }) => {
    try {
        const { data } = await instance.put(`/comments/bulk-action`, { comment_ids, action });
        return data;
    } catch (error) {
        console.error("Lỗi khi thực hiện bulk action:", error);
        throw error;
    }
};
export const CommentServices = {
    fetchComments,
    createComment,
    updateComment,
    bulkAction
}