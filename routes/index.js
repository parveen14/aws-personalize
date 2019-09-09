'use strict'

require('dotenv').config();

const express = require('express'),
          AWS = require('aws-sdk');

const router = express.Router();

AWS.config.update({region:'us-east-1'});

let personalizeevents = new AWS.PersonalizeEvents();

// Function to build necesssary params for personalize api
let buildEventParams = (userID, itemID, category, session) => {
  let itemProps = {
    itemId: itemID,
    eventValue: category
  };

  let params = {
    eventList: [ 
      {
        eventType: 'PAGE_VIEW', 
        properties: itemProps,
        sentAt: Date.now()
      },
    ],
    sessionId: session,
    trackingId: process.env.TRACKING_ID,
    userId: userID
  };

  return params;
}
// Homepage Route
router.get('/', (req, res, next) => {
  res.send('Hello World - Personalize demo');
});

router.get('/send-events', (req, res, next)=>{
  let user = req.query.userId;
  let item = req.query.itemId;
  let category = req.query.category;
  let session = req.query.sessionId;
  console.log('[ANDREAS LOG] Incoming event!');
  let eventParams = buildEventParams(user, item, category, session);

  console.log('[ANDREAS PERSONALIZE EVENT SENDER] Event Params: ', JSON.stringify(eventParams));
  
  console.log('[ANDREAS PERSONALIZE EVENT SENDER] calling putEvents()');
  
  // promise to handle sending event
  const promise = new Promise((resolve, reject) => {

    // calling personalize api
    personalizeevents.putEvents(eventParams, (err, data) => {
      if (err) {
        console.log('[ANDREAS PERSONALIZE EVENT SENDER] ERROR calling putEvents()');
        console.log(err, err.stack);
        res.status(500);
        res.send('Oops there was a problem...');
      }
      else {
        console.log('[ANDREAS PERSONALIZE EVENT SENDER] Successfully putEvents()');
        console.log(data);  
        res.status(200);
        res.send('Sent event hell ya!');
      }
    });
  });
})


module.exports = router