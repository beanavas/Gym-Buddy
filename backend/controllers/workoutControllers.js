// separate page for controllers 

//import workout schema
const Workout = require('../models/WorkoutModel')

// import mongoose
const mongoose = require('mongoose')

// get all workouts
const getWorkouts = async (req, res) => {
    //gets all workouts ({}) and sorts them by date in descending order (-1)
    const workouts = await Workout.find({ }).sort({createdAt: -1})

    res.status(200).json(workouts)
}

// get a single workout
const getWorkout = async (req, res) => {
    //grabbing id parameter from request
    const {id} = req.params

    //if its not a valid id
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({message: 'Invalid id'})
    }

    const workout = await Workout.findById(id)

    //if workout isnt found
    if(!workout) {
        return res.status(404).json({error: 'No such workout'})
    }

    //if its found we return it
    res.status(200).json(workout)
}

// create a new workout 
const createWorkout = async (req, res) => {
    const {title, load, reps} = req.body

    // detect which fields are empty 
    let emptyFields = []

    if(!title) {
        emptyFields.push('title')
    }
    if(!load) {
        emptyFields.push('load')
    }
    if(!reps) {
        emptyFields.push('reps')
    }
    if(emptyFields.length > 0){
        return res.status(400).json({error: 'Please fill in all the fields', emptyFields})
    }
    //add new workout to database
    try{
        const workout = await Workout.create({title, load, reps})
        res.status(200).json(workout)
    } catch(error){
        res.status(400).json({error: error.message})
    }   
    res.json({mssg: 'POST a new workout'})
}

// delete workout 
const deleteWorkout = async (req, res) => {
    const {id} = req.params

    // check if its not a valid id
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({message: 'Invalid id'})
    }

    // find and delete for _id (which is the id found) is equal to id
    const workout = await Workout.findByIdAndDelete({_id: id})

    //if workout isnt found
    if(!workout) {
        return res.status(404).json({error: 'No such workout'})
    }

    res.status(200).json(workout)

}

// update a workout
const updateWorkout = async (req, res) => {
    const {id} = req.params

    // check if its not a valid id
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({message: 'Invalid id'})
    }

    const workout = await Workout.findByIdAndUpdate({_id: id}, {
        ...req.body
    })

    //if workout isnt found
    if(!workout) {
        return res.status(404).json({error: 'No such workout'})
    }
    
    res.status(200).json(workout)

}

// for machine learning model 
// finding muscle group usage per workout

const exerciseLibrary = require('../data/exerciseLibrary');

const getMuscleUsage = async (req, res) => {
  try {
    const workouts = await Workout.find();

    const muscleCount = {};

    // loops through each workout, then each exercise in the workout
    workouts.forEach(workout => {
      const match = exerciseLibrary.find(
        ex => ex.name.toLowerCase() === workout.title.toLowerCase()
      );

      // if it finds the workout , add the muscle to the muscleCount object for data analysis
      if (match) {
        match.muscleGroups.forEach(group => {
          muscleCount[group] = (muscleCount[group] || 0) + 1;
        });
      }
    });

    //prints muscle count for each muscle
    res.status(200).json(muscleCount);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const muscleRegionMap = require('../data/muscleRegion')

const getRegionUsage = async (req, res) => {
    try {
      const workouts = await Workout.find();
  
      const regionCount = {};
  
      workouts.forEach((workout) => {

        // loops through each exercise in the workout and tries to find match
        const match = exerciseLibrary.find(
          ex => ex.name.toLowerCase() === workout.title.toLowerCase()
        );
  
        if (match) {

          match.muscleGroups.forEach(muscle => {
            const normalized = muscle.toLowerCase();
  
            // Count region
            const region = muscleRegionMap[normalized] || 'Other';
            regionCount[region] = (regionCount[region] || 0) + 1;
          });
        }
      });

  
      const regionStats = Object.entries(regionCount).map(([region, count]) => ({
        region,
        count
      }));
  
      regionStats.sort((a, b) => b.count - a.count);
  
      res.status(200).json({
        regions: regionStats
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


// get day of the week 

const getWeekdayUsage = async (req, res) => {
  try {
    const workouts = await Workout.find();

    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const dayCount = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0,
      Thursday: 0, Friday: 0, Saturday: 0
    };

    workouts.forEach(workout => {
      const dayIndex = new Date(workout.createdAt).getDay();
      const dayName = days[dayIndex];
      dayCount[dayName]++;
    });

    // Ensure every day is in the response even if 0
    const result = days.map(day => ({
      day,
      count: dayCount[day]
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getRecommendations = async (req, res) => {
  try {
    const workouts = await Workout.find(); // your workouts

    const userWorkouts = workouts.map(w => w.title);

    const regionCount = {}; // Legs, Back, etc.

    workouts.forEach(workout => {
      const match = exerciseLibrary.find(ex => ex.name.toLowerCase() === workout.title.toLowerCase());
      if (match) {
        match.muscleGroups.forEach(muscle => {
          const region = match.group;
          regionCount[region] = (regionCount[region] || 0) + 1;
        });
      }
    });

    // Example mock: Based on user's "cluster"
    const cluster_workouts = {
      0: ["Squat", "Plank", "Lunges", "Hip Thrust"],
      1: ["Bench Press", "Sit-Up", "Deadlift"],
      2: ["Dumbbell Curl", "Arnold Press", "Tricep Dips"]
    };

    // (simplified): always assign to cluster 0 for now
    const userCluster = 0;
    const recs = cluster_workouts[userCluster].filter(w => !userWorkouts.includes(w));

    res.status(200).json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Balancer Workouts //
const getBalancedRecommendations = async (req, res) => {
  try {
    const workouts = await Workout.find();

    const allRegions = ["Legs", "Core", "Back", "Chest", "Shoulders", "Arms", "Glutes", "Full Body"];
    const regionCount = {};

    // Initialize with 0
    allRegions.forEach(region => regionCount[region] = 0);

    // Count region appearances
    workouts.forEach(w => {
      const match = exerciseLibrary.find(ex => ex.name.toLowerCase() === w.title.toLowerCase());
      if (match) {
        const group = match.group;
        regionCount[group] = (regionCount[group] || 0) + 1;
      }
    });

    // Target ideal = 1 for each
    const undertrained = [];
    allRegions.forEach(region => {
      if (regionCount[region] < 1) {
        undertrained.push(region);
      }
    });

    // Suggest exercises from undertrained regions
    const doneWorkouts = workouts.map(w => w.title);
    const suggestions = [];

    undertrained.forEach(region => {
      const suggestion = exerciseLibrary.find(ex => ex.group === region && !doneWorkouts.includes(ex.name));
      if (suggestion) suggestions.push(suggestion.name);
    });

    res.status(200).json({ recommendations: suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const parseSmartWorkout = (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'No message provided' });

  const titleMatch = message.match(/squat|lunge|plank|pull[- ]?ups?|bench press|deadlift|curl/i);
  const loadMatch = message.match(/(\d+)\s?(lbs|pounds?)/i);
  const repsMatch = message.match(/(\d+)\s?(reps?|sets?)/i);

  const result = {
    title: titleMatch ? titleMatch[0] : '',
    load: loadMatch ? parseInt(loadMatch[1]) : '',
    reps: repsMatch ? parseInt(repsMatch[1]) : '',
  };

  res.status(200).json(result);
};

module.exports = {
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
    parseSmartWorkout,
}