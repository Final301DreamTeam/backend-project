'use strict'


require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);
const Items = require('./models/ItemModel.js');

async function seed()
{
        await Items.create({
            title: 'noName',
            description: 'test item',
            status: "checkedout"
    });
        await Items.create({
            title: 'noName2',
            description: 'test2 item',
            status: "checkedout2"
    });

    mongoose.disconnect();
}
let checker = (someVar) =>{
    console.log("-------------------------->",someVar,"<---------------------------------");
    return someVar;
}
seed();