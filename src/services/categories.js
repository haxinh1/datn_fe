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
        const { data } = await instance.post('/categories/create', payload)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const categoryServices = {
    fetchCategories,
    createCategory
}