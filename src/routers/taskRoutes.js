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

// GET /tasks?completed=(true/false)
// GET /tasks?limit=10&skip=0 (pagination)
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = (parts[1] === "desc" ? -1 : 1);
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).render('main', {
            title: 'Tasks',
            user: req.user,
            id: req.user._id.toString(),
            tasks: req.user.tasks
        }) 
    } catch (err) {
        res.status(500).send(err)
    }

})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, author: req.user._id })
        
        if (!task) {
            return res.status(404).send()
        }

        res.status(200).send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
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

        const task = await Task.findOne({_id, author: req.user._id})
        
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

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({_id, author: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        res.status(200).send(task)

    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router