// For practicing tests
const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, object) => {
        return accumulator + object.likes
    }, 0)
}

const favoriteBlog = (blogs) => {
    // First all the likes will be compared and at last the object that has received the most likes is returned
    return blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog, 0)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}