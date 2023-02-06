const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
  blogsRouter.post('/', (request, response) => {
    const body = request.body

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0
    })
    if (blog.title !== undefined || blog.title !== "" || blog.url !== undefined || blog.url !== "" ) {
      blog
        .save()
        .then(result => {
          response.status(201).json(result)
        })
    } else {
      blog
        .then(() => {
          response.status(400).end()
        })
    }
  })

  module.exports = blogsRouter