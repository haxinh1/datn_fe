function formatDate(dateString) {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("vi-VN");

    return formattedDate

}


export default formatDate