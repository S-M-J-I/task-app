const express = require('express')
const User = require('../models/User')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const mailjet = require('../middleware/mailjet')

// ? create a user resource
router.post('/users/signup', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        res.cookie('Authorization', `Bearer ${token}`, {
            maxAge: 600000,
        })

        await mailjet.sendWelcomeEmail(user.email, user.name)

        res.status(201).redirect('/users/me')
    } catch (err) {
        res.status(400).render('error', {
            title: `Error 400`,
            err: err.message
        })
    }

})

router.get('/users/signup', (req, res) => {
    res.render('signup', {
        title: "Sign-Up",
    })
})

// ? logging in users
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

    
        res.cookie('Authorization', `Bearer ${token}`, {
            maxAge: 600000,
        })

        res.status(201).redirect('/tasks')
    } catch (err) {
        res.status(400).render('login', {
            title: `Login`,
            err: err.message
        })
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
        res.status(500).render('error', {
            title: `Error 500`,
            err: err.message
        })
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.clearCookie('Authorization')
    
        res.status(200).redirect('/users/login')
    } catch (err) {
        res.status(500).render('error', {
            title: `Error 500`,
            err: err.message
        })
    }
})


// ? get user
router.get('/users/me', auth, async (req, res) => {
    res.status(200).render('me', {
        title: 'Dashboard',
        user: req.user,
        id: req.user._id.toString()
    })
}, (error, req, res, next) => {
    res.send({error: error.message})
})

router.get('/users/me/update', auth, (req, res) => {
    res.status(200).render('update', {
        title: 'Update',
        user: req.user
    })
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
        res.status(201).redirect('/users/me')

    } catch (err) {
        res.status(500).send(err)
    }
}, (error, req, res, next) => {
    res.send({error: error.message})
})

router.get('/users/me/delete', auth, async (req, res) => {
    res.render('delete', {
        title: 'Delete Account'
    })
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await mailjet.sendGoodbyeEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.status(200).redirect('/users/login')
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
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// delete image
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//get image resource
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error();
        }
        
        res.set('Content-Type', 'image/png')
        res.status(200).send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router