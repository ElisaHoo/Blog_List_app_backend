const bcrypt = require('bcrypt')
const { request, response } = require('../app')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body


    if (password === undefined) {
        response.status(400).json({error: 'Password is missing'})
    } else if (password.length < 3) {
        response.status(400).json({error: 'Password must be at least three characters long'})
    }

    const saltRounds = 10  // Module go through 2^10 hashing iterations
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})

module.exports = usersRouter