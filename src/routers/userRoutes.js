const express = require('express')
const User = require('../models/User')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const upload = multer({
    dest: 'images'
})

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
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
    
        res.status(200).send()
    } catch (err) {
        res.status(500).send(err)
    }
})


// ? get user
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
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
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.status(200).send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
    res.status(200).send()
})

module.exports = router