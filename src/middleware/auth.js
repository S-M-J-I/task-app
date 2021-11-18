const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        // get the token from cookies
        const token = req.cookies['Authorization'].replace('Bearer ', '')
        // get the decoded one by verifying the token, return the user
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        // find the user from the decoded token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        
        // if user not found
        if(!user) {
            throw new Error("User not found")
        }

        // set the token to be the one we got from cookies
        req.token = token
        // set the user to be the one we found from the decoded user and token
        req.user = user

        // exit middleware
        next()

    } catch (err) {
        res.status(401).redirect('/users/login')
    }
}

module.exports = auth