import instance from "../axios"

const createCart = async (payload, id) => {
    try {
        const { data } = await instance.post(`/cart/add/1`, payload);
        return data
    } catch (error) {
        console.log(error);
    }
}

export const CartServices = {
    createCart
}