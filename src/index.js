const express = require('express')
require('./db/mongoose') // don't assign a const, this declaration means that it will always run
const userRoutes = require('./routers/userRoutes')
const taskRoutes = require('./routers/taskRoutes')
const path = require('path')
const hbs = require('hbs')
const app = express()
const port = process.env.PORT
const cookieParser = require('cookie-parser')
const compression = require('compression')
const helmet = require('helmet')
const methodOverride = require('method-override')

// converts all body responses to json responses
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(helmet())
app.use(compression())
app.use(methodOverride('_method'))

//define path dirs
const publicDir = path.join(__dirname, '../public');
const partialsDir = path.join(__dirname, '../public/templates/partials');
const viewsDir = path.join(__dirname, '../public/templates/views');


//set up the static objs
app.set('view engine', 'hbs');
app.set('views', viewsDir);
app.use(express.static(publicDir));
hbs.registerPartials(partialsDir);
hbs.registerHelper('if_eq', function(a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
})


app.get('/', (req, res) => {

    if(req.cookies['Authorization']) {
        res.redirect('/users/me')
    } else {
        res.render('home', {
            title: "Home"
        })
    }
      
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    })
})

// use routers
app.use(userRoutes)
app.use(taskRoutes)

app.use('*', (req, res) => {
    res.status(404).render('error', {
        title: 'Error 404',
        err: 'Page Not Found'
    })
})


// TODO: Remeber to remove the mongo connection path from mongoose header
app.listen(port , () => {
    console.log("Server is up! Port " + port)
})