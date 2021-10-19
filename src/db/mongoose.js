// start db: C:\Users\USER\mongodb\bin\mongod.exe --dbpath=C:\Users\USER\mongodb-data

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
})
