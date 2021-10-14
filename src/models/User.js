const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./Task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Email is invalid")
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.length < 6) {
                throw new Error("Make password greater than 6 characters")
            }

            if(value.toLowerCase() === "password") {
                throw new Error("Password cannot be 'password'")
            }
        }
    },
    age: {
        type: Number,
        default: 16,
        validate(value) {
            if(value <= 0) {
                throw new Error("Age must be a positive number")
            }

            if (value < 16) {
                throw new Error("You must be at least 16 years old for this service")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
})


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, "thisisanodeproj")

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
} 

userSchema.methods.toJSON = function (){
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user) {
        throw new Error("Unable to log in.")
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error("Unable to log in.")
    }

    return user
}


// hash password before saving
userSchema.pre('save', async function (next) {
    const user = this
    
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// delete user tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this

    await Task.deleteMany({ author: user._id })

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User