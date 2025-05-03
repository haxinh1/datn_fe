import instance from "../axios"

const fetchCategories = async () => {
    try {
        const { data } = await instance.get('/categories')
        return data
    } catch (error) {
        console.log(error)
    }
}
const createCategory = async (payload) => {
    try {
        const { data } = await instance.post('/cateadminCaes/create', payload)
        return data
    } catch (error) {
        console.log(error)
    }
}
const updateCategory = async (id, payload) => {
    try {
        const { data } = await instance.put(`/categories/update/${id}`, payload)
        return data
    } catch (error) {
        console.log(error)
    }
}
export const categoryServices = {
    fetchCategories,
    createCategory,
    updateCategory
}