const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    idString: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

taskSchema.pre('save', async function (next) {
    const task = this

    task.idString = task._id.toString()

    next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task