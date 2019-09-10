'use strict'

require('dotenv').config();

const express = require('express'),
          AWS = require('aws-sdk'),
           rp = require('request-promise');

const router = express.Router();

AWS.config.update({region:'us-east-1'});

let personalizeevents = new AWS.PersonalizeEvents();
let personalizeruntime = new AWS.PersonalizeRuntime();
let shopifyProducts;

var options = {
  uri: process.env.SHOPIFY_URL,
  json: true
};

rp(options).then((products) => {
  shopifyProducts = products.products;
  console.log(shopifyProducts);
});

// Helper to look up index in array of products
var getIndexIfObjWithOwnAttr = function(array, attr, value) {
  for(var i = 0; i < array.length; i++) {
    if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

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

let populateMetaData = (items) => {
  let populatedData = [];
  // let item = 'scarf';
  items.forEach(item => {
    let itemIndex = getIndexIfObjWithOwnAttr(shopifyProducts, 'handle', item.itemId);
    let itemData = {
        title: shopifyProducts[itemIndex].title,
        price: shopifyProducts[itemIndex].variants[0].price,
        image: shopifyProducts[itemIndex].image.src,
        url: `https://atticandbutton.com/products/${item.itemId}`
      }
      populatedData.push(itemData);
    });

  console.log('ITEM DATA ', populatedData);
  return populatedData;
}
router.get('/get-recs', (req, res, next)=>{
  console.log('[ANDREAS LOGGER] Calling get recs');

  let params = {
    campaignArn:req.query.campaign,
    itemId: req.query.itemId,
    numResults: Number(req.query.numResults),
    userId: req.query.userId
  };

  console.log('[ANDREAS LOGGING] Params for get recs ', params);

  personalizeruntime.getRecommendations(params, (err, data) => {
    if(err){
      console.log('[ANDREAS LOGGING] Error getting recs ');
      console.log(err, err.stack);
      res.status(500);
      res.send('Oops there was an error getting your recommendations - sad');
    }
    else {
      console.log('[ANDREAS LOGGING] We got recs back!');
      console.log('[ANDREAS LOGGING] heres the data ', data.itemList);
      let populatedProducts = populateMetaData(data.itemList);    
      res.setHeader('Content-Type', 'application/json');  
      res.send(populatedProducts);
    }
  })
})
module.exports = router