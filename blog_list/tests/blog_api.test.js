const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

describe('When there is initiallysome notes saved', () => {
    // Initializing test database
    beforeEach(async () => {
        await Blog.deleteMany({})
        let blogObject = new Blog(helper.initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(helper.initialBlogs[1])
        await blogObject.save()
    })

    test('There are two blogs in the database', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('Document\'s identificator is "id"', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })
})

describe('Addition of a new note', () => {
    test('Adding a blog is working', async () => {
        const response = await api.post('/api/blogs').send(helper.newBlog)
        expect(response.statusCode).toBe(201)
        expect(response.body.title).toBe(helper.newBlog['title'])
    })

    test('If no value is given to likes, value will be 0', async () => {
        const response = await api.post('/api/blogs').send(helper.newBlogWithoutLikes)
        expect(response.body.likes).toBe(0)
    })
    
    test('If no value is given to title or url, response statuscode is 400', async () => {
        const response = await api.post('/api/blogs').send(helper.newBlogWithoutTitle).send(helper.newBlogWithoutUrl)
        expect(response.body.title).toBe("React patterns")
        expect(response.body.url).toBe("https://reactpatterns.com/")
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})