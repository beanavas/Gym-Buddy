const express = require('express');

//create instance of routes
const router = express.Router()



//import controllers
const {
    createWorkout,
    getWorkout,
    getWorkouts,
    deleteWorkout,
    updateWorkout,
    getMuscleUsage,
    getRegionUsage,
    getWeekdayUsage,
    getRecommendations,
    getBalancedRecommendations,
    parseSmartWorkout
} = require('../controllers/workoutControllers')

// ROUTES //

// Must put specific routes before dynamic ones 

// POST Sentece and parse through it 
router.post('/parse', parseSmartWorkout);

// GET recommendations from ml model 
router.get('/recommend-balanced', getBalancedRecommendations);
router.get('/recommendations', getRecommendations);

// GET day of week 
router.get('/weekday-usage', getWeekdayUsage)

// GET muscle usage for a workout
router.get('/muscle-usage', getMuscleUsage);

// GET muscle usage for a workout
router.get('/region-usage', getRegionUsage);

//GET all workouts
router.get('/', getWorkouts);

//GET a single workout 
//colon represents a parameter that can change
router.get('/:id', getWorkout)

//POST a new workout
router.post('/', createWorkout)

//DELETE a workout
router.delete('/:id', deleteWorkout)

//UPDATE a workout
router.patch('/:id', updateWorkout)

//export router
module.exports = router