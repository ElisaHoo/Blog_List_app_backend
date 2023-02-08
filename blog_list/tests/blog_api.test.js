const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)
const User = require('../models/user')

describe('When there is initially some notes saved', () => {
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


    describe('Addition of a new note', () => {
        test('Adding a blog is working', async () => {
            await api
                .post('/api/blogs')
                .send(helper.newBlog)
                .expect('Content-Type', /application\/json/)
                .expect(201)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
            
            const titles = blogsAtEnd.map(b => b.title)
            expect(titles).toContain(helper.newBlog.title)
        })

        test('If no value is given to likes, value will be 0', async () => {
            const response = await api
                .post('/api/blogs')
                .send(helper.newBlogWithoutLikes)
            expect(response.body.likes).toBe(0)
        })
        
        test('If no value is given to title or url, response statuscode is 400', async () => {
            const response = await api
                .post('/api/blogs')
                .send(helper.newBlogWithoutTitle)
                .send(helper.newBlogWithoutUrl)
            expect(response.body.title).toBe("React patterns")
            expect(response.body.url).toBe("https://reactpatterns.com/")
        })
    })

    describe('Deletion of a blog', () => {
        test('Delete the first blog from the list', async () => {
            const blogsInTheBeginning = await helper.blogsInDb()
            const deletedBlog = blogsInTheBeginning[0]
            await api
                .delete(`/api/blogs/${deletedBlog.id}`)
                .expect(204)

            const blogsAtTheEnd = await helper.blogsInDb()
            expect(blogsAtTheEnd).toHaveLength(helper.initialBlogs.length - 1)

            const titles = blogsAtTheEnd.map(b => b.title)
            expect(titles).not.toContain(deletedBlog.title)
        })
    })

    describe('Changing information', () => {
        test('Update the first blog\'s information', async () => {
            const blogsInTheBeginning = await helper.blogsInDb()
            const updatedBlog = blogsInTheBeginning[0]

            await api
                .put(`/api/blogs/${updatedBlog.id}`).send(helper.updatedLikes)
                .expect(200)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsInTheBeginning[0].likes).not.toBe(blogsAtEnd[0].likes)           
        })
    })
})

describe('When there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('topsecret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()
        
        const newUser = {
            username: 'mmeikala',
            name: 'Maija Meikäläinen',
            password: 'salaSana'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length +1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'secret'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('New user will not be created, if username is too short', async () => {
        const newUser = {
            username: 'ad',
            name: 'Administrator',
            password: 'secret'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Username must be at least three characters long')
        
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).not.toContain(newUser.username)
    })

    test('New user will not be created if password is too short', async () => {
        const newUser = {
            username: 'admin',
            name: 'Administrator',
            password: 's'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Password must be at least three characters long')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).not.toContain(newUser.username)
    })

    test('New user will not be created if password is missing', async () => {
        const newUser = {
            username: 'admin',
            name: 'Administrator'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        expect(result.body.error).toContain("Password is missing")

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).not.toContain(newUser.username)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})