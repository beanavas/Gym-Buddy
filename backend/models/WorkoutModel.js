const mongoose = require('mongoose')

const Schema = mongoose.Schema 

//title is workout, reps is amount of reps of workout
//second component for time stamps 
//schema definds the structure of the data
const workoutSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    load: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Workout', workoutSchema)