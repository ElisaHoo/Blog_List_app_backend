const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const { request, response } = require('../app')

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body

    const user = await User.findOne({ username })  // Find the user corresponding to the requested username from db
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash) // Check if the requested password matches with the password (hash) in the db
    
    if(!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    // If the passwords match, token is created with jwt.sign -method, which contains the username and user id in a digitally signed form
    const token = jwt.sign(userForToken, process.env.SECRET)

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter