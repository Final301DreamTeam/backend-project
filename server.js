'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const Item = require('./models/ItemModel.js');
const axios = require('axios');
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


    try{
      const userCity = request.query.location;
      const userInput = request.query.term;
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
    const createdItem = await Item.create(request.body);
    response.status(200).send(createdItem);
  }
  catch (error)
  {
    console.log('An error occurred in addItem callback: ', error.message);
    next(error);
  }
}

async function deleteItem(request, response, next) {
  // capture the id in the url
  let id = request.params.id;
  try {
    // attempt delete using mongoose
    await Item.findByIdAndDelete(id);
    response.status(200).send('Item deleted.')
  }
  catch (error) {
    console.log('An error occurred in deleteItem callback: ', error.message);
    next(error);
  }
}

async function putItem(request, response, next)
{
  try{
    let id = request.params.id;
    let updatedItem = await Item.findByIdAndUpdate(id, request.body, { new: true, overwrite: true});
    response.status(200).send(updatedItem);
  }
  catch(error){
    next(error);
  }
}

// serverurl/item/<item_id>

app.post('/restaurants', postRestaurants);

app.get('/restaurants', getRestaurants);

app.delete('/restaurants/:id', deleteItem);

app.put('/restaurants/:id', putItem);

app.get('/', (request, response) => {

    response.send('test requested');
});



class RestaurantData {
  constructor(rest)
  {
      //console.log("HERE", rest);
    this.name = rest.name;
    this.rating = rest.rating;
    this.address = rest.location.display_address;
    this.city = rest.location.city;
    this.image_url = rest.image_url;
    this.state = rest.location.state;
    this.zip_code = rest.location.zip_code;
    this.price = rest.price;
    this.notes = '';
    return;
  }
}





app.get('*', (request, reponse) => response.status(404).send('not correct webpage. try again'))

app.listen(PORT, () => console.log(`listening on ${PORT}`));