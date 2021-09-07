const express = require('express')
require('./db/mongoose') // don't assign a const, this declaration means that it will always run
const userRoutes = require('./routers/userRoutes')
const taskRoutes = require('./routers/taskRoutes')
const path = require('path')
const hbs = require('hbs')
const app = express()
const port = process.env.PORT || 3000

// converts all body responses to json responses
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//define path dirs
const publicDir = path.join(__dirname, '../public');
const partialsDir = path.join(__dirname, '../public/templates/partials');
const viewsDir = path.join(__dirname, '../public/templates/views');


//set up the static objs
app.set('view engine', 'hbs');
app.set('views', viewsDir);
app.use(express.static(publicDir));
hbs.registerPartials(partialsDir);


app.get('/', (req, res) => {
    res.render('home', {
        title: "Home"
    })
})

// use routers
app.use(userRoutes)
app.use(taskRoutes)


// TODO: Remeber to remove the mongo connection path from mongoose header
app.listen(port , () => {
    console.log("Server is up!")
})

const Task = require('./models/Task')
const User = require('./models/User')

const main = async () => {
    // const task = await Task.findById('61374992babdcd4bac5c7b84')
    // await task.populate('author').execPopulate()
    // console.log(task.author)

    const user = await User.findById('6136039124744630b0b5d3c1')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)

}

main()