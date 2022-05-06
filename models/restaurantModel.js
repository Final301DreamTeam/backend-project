'use strict'

//  TODO: collapse 4 and 6 into one-line {schema} = require(mongoose)
const mongoose = require('mongoose')
//extracting the schema property from the mongoose object
const {Schema} = mongoose;

//create a something schema, defin how our somehting objects will be structured

const restaurantSchema = new Schema({//properties of something is instantiated below

    name : {type: String, required: true},
    rating: {type: String, required: true},
    address: {type: Array, required: true},
    city: {type: String, required: true},
    image_url: {type: String, required: true},
    state: {type: String, required: true},
    zip_code: {type: String, required: true},
    price:{type: String, required: false},
    notes: {type: String, required: false},
    review_count: {type: String, required: false},
    lon: {type: Number, required: false},
    lat: {type: Number, required: false}
});


//define our model

//this will give functionality 
const restaurant = mongoose.model('restaurants', restaurantSchema);
module.exports = restaurant;