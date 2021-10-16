const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies['Authorization'].replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisisanodeproj')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if(!user) {
            throw new Error("User not found")
        }

        req.token = token
        req.user = user
        next()

    } catch (err) {
        res.status(401).render('error',{err: "Please authenticate."})
    }
}

module.exports = auth