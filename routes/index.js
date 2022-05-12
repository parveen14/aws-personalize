'use strict'
require('dotenv').config();

const express = require('express'),
          AWS = require('aws-sdk'),
      helpers = require('../src/helpers');

const router = new express.Router();

AWS.config.update({region:process.env.AWS_REGION});

// Initialize AWS SDK for Personalize functions
let personalizeevents = new AWS.PersonalizeEvents();
let personalizeruntime = new AWS.PersonalizeRuntime();

// Homepage Route
router.get('/', (req, res, next) => {
  res.send('Hello World - AWS Personalize demo');
});

// Endpoint to send results to Personalize
router.get('/send-user-events', (req, res, next)=>{
  let user = req.query.userId;
  let age = req.query.age;
  let gender = req.query.gender;
  let session = req.query.sessionId;
  console.log('Incoming event!');
  let eventParams = helpers.buildEventParams(user, age, gender, session);

  console.log('Event Params: ', JSON.stringify(eventParams));  
  console.log('calling putEvents()');
  

  // calling personalize api
  personalizeevents.putEvents(eventParams, (err, data) => {
    if (err) {
      console.log('ERROR calling putEvents()');
      console.log(err, err.stack);
      res.status(500);
      res.send('Oops there was a problem...');
    }
    else {
      console.log('Successfully putEvents()');
      console.log(data);  
      res.status(200);
      res.send('Sent event heck ya!');
    }
  });
});


router.get('/add-user', (req, res, next)=>{
  console.log('Calling add user');
  let params = {
    datasetArn: process.env.USER_DATASET_ARN, /* required */
    users: [ /* required */
      {
        userId: req.query.userId, /* required */
        properties: {
          age:Number(req.query.age),
          gender:req.query.gender
        }
      },
      /* more items */
    ]
  };

  personalizeevents.putUsers(params, (err, data) => {
    if(err){
      console.log('Error putting recs ');
      console.log(err, err.stack);
      res.status(500);
      res.send('Oops there was an error putting records');
    }
    else {
      console.log('Successfully putItems()');
      console.log(data);  
      res.status(200);
      res.send('Sent event heck ya!');
    }
  })
})

router.get('/get-recs', (req, res, next)=>{
  console.log('Calling get recs');
  let params = {
    campaignArn:process.env.CAMPAIGN_ARN,
    itemId: req.query.itemId,
    numResults: Number(req.query.numResults)
  };

  console.log('Params for get recs ', params);

  personalizeruntime.getRecommendations(params, (err, data) => {
    if(err){
      console.log('Error getting recs ');
      console.log(err, err.stack);
      res.status(500);
      res.send('Oops there was an error getting your recommendations - sad');
    }
    else {
      console.log('We got recs back!');
      console.log('heres the data ', data.itemList);
      // let populatedProducts = populateMetaData(data.itemList);    
      res.setHeader('Content-Type', 'application/json');  
      res.send(data.itemList);
    }
  })
})
module.exports = router