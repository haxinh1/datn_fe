const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
};

export default formatVND