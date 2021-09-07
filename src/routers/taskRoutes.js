const express = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        res.status(400).send(err)
    }

})

router.get('/tasks', async (req, res) => {
    
    try {
        const tasks = await Task.find({})
        res.status(200).send(tasks) 
    } catch (err) {
        res.status(500).send(err)
    }

})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send()
        }

        res.status(200).send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]

    const isValidUpdate = updates.every((updateItem) => {
        return allowedUpdates.includes(updateItem)
    })

    if(!isValidUpdate) {
        return res.status(400).send({error: "Invalid update! Are you trying to update something else other than description or completed?"})
    }

    const _id = req.params.id
    
    try {

        const task = await Task.findById(_id);
        
        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        res.status(201).send(task)

    } catch (err) {
        res.status(500).send(err)
    }

})

router.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findByIdAndDelete(_id)

        if(!task) {
            return res.status(404).send()
        }

        res.status(200).send(task)

    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router