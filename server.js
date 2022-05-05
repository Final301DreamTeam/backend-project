'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const Restaurant = require('./models/restaurantModel.js');
const axios = require('axios');
const verifyUser = require('./auth');


//schema

mongoose.connect(process.env.DB_URL);
//AUTHENTICATION
//const authUser = require('./auth');

//add validation to confirm we are wired to mongodb
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'cennection error:'));
db.once('open', function(){
    console.log('Mongoose is connected');
});

//middleware
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
async function getRestaurants(request, response, next)
{
    /*
  authUser(request, async (error, user) =>{
    if(error) {
      console.error(error);
      response.send('token recieved is invalid, try again');
    }
    else{
        */
       //const searchObject = {};
       //if(request.query.email) searchObject.email = req.query.email;
    try{
      //const restaurantFromDb = await Restaurant.find(searchObject);
      //if(restaurantFromDb.length > 0)
        //response.status(200).send()

      const userCity = request.query.location;
      const userInput = request.query.term;
      //const gAddress = request.query.address;
      const url = `https://api.yelp.com/v3/businesses/search?&limit=15&term=${userInput}&location=${userCity}&apiKey=${process.env.apiKey}`;
      let foodData = await axios.get(url, {
        headers:{
          'Authorization': `Bearer ${process.env.apiKey}`
        }
      });
      
      let yelpedData = foodData.data.businesses.map(loc => {return new RestaurantData(loc)})
        response.status(200).send(yelpedData);
    }catch(error)
    {
        next(error);
    }
    //}});
}




async function postRestaurants(request, response, next)
{
  try {
    //  create a record and save
    const createdRestaurant = await Restaurant.create(request.body);
    response.status(200).send(createdRestaurant);
  }
  catch (error)
  {
    console.log('An error occurred in addrestaurant callback: ', error.message);
    next(error);
  }
}

async function deleteRestaurant(request, response, next) {
  // capture the id in the url
  let id = request.params.id;
  try {
    // attempt delete using mongoose
    await Restaurant.findByIdAndDelete(id);
    response.status(200).send('restaurant deleted.')
  }
  catch (error) {
    console.log('An error occurred in deleteRestaurant callback: ', error.message);
    next(error);
  }
}

async function putRestaurant(request, response, next)
{
  try{
    let id = request.params.id;
    let updatedRestaurant = await Restaurant.findByIdAndUpdate(id, request.body, { new: true, overwrite: true});
    response.status(200).send(updatedRestaurant);
  }
  catch(error){
    next(error);
  }
}

// serverurl/restaurant/<restaurant_id>

app.post('/restaurants', postRestaurants);

app.get('/restaurants', getRestaurants);

app.delete('/restaurants/:id', deleteRestaurant);

app.put('/restaurants/:id', putRestaurant);

app.get('/', (request, response) => {

    response.send('test requested');
});



class RestaurantData {
  constructor(rest)//objects with data
  {
      //console.log("HERE----->", rest, "<-----HERE");
    this.name = rest.name;
    this.rating = rest.rating;
    this.address = rest.location.display_address;
    this.city = rest.location.city;
    this.image_url = rest.image_url;
    this.state = rest.location.state;
    this.zip_code = rest.location.zip_code;
    this.price = rest.price;
    this.notes = '';
    this.review_count = rest.review_count;
    this.lat = rest.coordinates.latitude;
    this.lon = rest.coordinates.longitude;

    //google object info with data
    //this.gdata = this.getGoogleMapData(this.address);


    return;
  }

  async getGoogleMapData (addy){
    console.log(addy, "<---- HERE");

      const googleRequest = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${addy}&key=${process.env.GAPI_KEY}`);
      console.log("HERE ---->", googleRequest.data,"<--------HERE");
      return googleRequest;

  };
}
/*
class GoogleData {
  let address;
  let key;
  constructor(data)
  {
  }
  getGoogleMapData = (data => {
    console.log(data);
      //console.log("HERE ---->", googleRequest,"<--------HERE");
  });
}
*/





app.get('*', (request, reponse) => response.status(404).send('not correct webpage. try again'))

app.listen(PORT, () => console.log(`listening on ${PORT}`));