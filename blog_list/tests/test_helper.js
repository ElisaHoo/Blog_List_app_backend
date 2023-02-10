const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0
      },
      {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
      }  
]

const newBlog = {
  title: "React patterns",
  author: "Michael Chan",
  url: "https://reactpatterns.com/",
  likes: 7
  }

  const newBlogWithoutLikes = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/"
  }

  const newBlogWithoutTitleUrl = {
    author: "Michael Chan",
    likes: 7
  }

  const updatedLikes = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 76
    }

  const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }

  const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }

  module.exports = {
    initialBlogs,
    newBlog,
    newBlogWithoutLikes,
    newBlogWithoutTitleUrl,
    blogsInDb,
    updatedLikes,
    usersInDb
  }