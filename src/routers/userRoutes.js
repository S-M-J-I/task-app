const express = require('express')
const User = require('../models/User')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')

// ? create a user resource
router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (err) {
        res.status(400).send(err)
    }

})

router.get('/users/signup', (req, res) => {
    res.render('signup', {
        title: "Sign-Up"
    })
})

// ? logging in users
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (err) {
        res.status(400).send()
    }

})

router.get('/users/login', (req, res) => {
    return res.render('login', {
        title: "Login"
    })
})


router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
    
        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
    
        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})


// ? get user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
}, (error, req, res, next) => {
    res.send({error: error.message})
})


// ? update user by id
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdatesArray = ["name", "email", "password", "age"]
    const isValidUpdate = updates.every((updateItem) => {
        return allowedUpdatesArray.includes(updateItem)
    })

    if(!isValidUpdate) {
        return res.status(400).send({error: "Invalid update! Are you updating something else other than name, age, passowrd, or email?"})
    }

    try {

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        
        await req.user.save()
        res.status(201).send(req.user)

    } catch (err) {
        res.status(500).send(err)
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (err) {
        res.status(500).send({err: err.message})
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})



const upload = multer({
    limits: {
        fileSize: 2_000_000
    },
    fileFilter(req, file, callback) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/) ) {
            callback(new Error("Please upload an image (.jpg/.jpeg/.png)"))
        }

        callback(undefined, true)
    }
})


// add user profile image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

module.exports = router