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
export const CommentServices = {
    fetchComments,
    createComment,
    updateComment
}