//require .env
require('dotenv').config()

//require mongoose
const mongoose = require('mongoose')

// require express package
const express = require('express');

// require routes 
const workoutRoutes = require('./routes/workouts');

// start express app
const app = express();

// middleware


app.use(express.json())

// req and res is needed for next
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//to react to requests

// workout 
app.use('/api/workouts', workoutRoutes);


// connect to DB
mongoose.connect(process.env.MONGO_UI)
.then(() => {
    // listen for requests on port 4000
    app.listen(process.env.PORT, () => {
        console.log('Connected to db & Server is running on port', process.env.PORT);
    })
})
.catch((error) => {
    console.log(error)
})


