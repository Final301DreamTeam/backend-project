'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Item = require('./models/ItemModel.js');
const res = require('express/lib/response');


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

async function getItems(request, response, next)
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
        let queryObj = {};
        if(request.query.result){
            queryObj.description = request.query.description;
        }
        let results = await Item.find();
        //let results = await Item.find(queryObj);
        response.status(200).send(results);
    }catch(error)
    {
        next(error);
    }
    //}});
}

async function postItems(request, response, next)
{
  try {
    //  get info from body of request object
    console.log('request.body: ',request.body);

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
  // console.log('id: ',id);
  
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

app.post('/items', postItems);

app.get('/items', getItems);

app.delete('/item/:id', deleteItem);

app.put('/item/:id', putItem);

app.get('/', (request, response) => {
    response.send('test requested');
});
app.get('*', (request, reponse) => response.status(404).send('not correct webpage. try again'))

app.listen(PORT, () => console.log(`listening on ${PORT}`));