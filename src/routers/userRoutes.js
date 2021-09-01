const express = require('express')
const User = require('../models/User')
const router = new express.Router()

// ? create a user resource
router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (err) {
        res.status(400).send(err)
    }

})

router.get('/users/signup', (req, res) => {
    res.render('signup', {
        title: "Sign-Up"
    })
})

// ? loggin in users
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        res.send(user)
    } catch (err) {
        res.status(400).send(err)
    }

})

router.get('/users/login', (req, res) => {
    return res.render('login', {
        title: "Login"
    })
})


// ? get all users
router.get('/users', async (req, res) => {

    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (err) {
        res.status(500).send(err)
    }

})

// ? get a single user by id
router.get('/users/:id', async (req, res) => {
    
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if(!user) {
            return res.status(404).send()
        }
        res.status(200).send(user)
    } catch(err) {
        res.status(500).send(err)
    }

})

// ? update user by id
router.patch('/users/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdatesArray = ["name", "email", "password", "age"]
    const isValidUpdate = updates.every((updateItem) => {
        return allowedUpdatesArray.includes(updateItem)
    })

    if(!isValidUpdate) {
        return res.status(400).send({error: "Invalid update! Are you updating something else other than name, age, passowrd, or email?"})
    }

    const _id = req.params.id

    try {
        
        const user = await User.findById(_id);

        if(!user) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()

        res.status(201).send(user)

    } catch (err) {
        res.status(500).send(err)
    }
})

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findByIdAndDelete(_id)

        if(!user) {
            return res.status(404).send()
        }

        res.status(200).send(user)

    } catch (err) {
        res.status(500).send(err)
    }
})



module.exports = router