import instance from "../axios"; // axios instance với base URL

const fetchVariants = async () => {
    const response = await instance.get("/allVariant");
    return response.data; // Trả về data từ BE
}

export const variantsServices = {
    fetchVariants
}
