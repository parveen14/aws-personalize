'use strict'
require('dotenv').config();

const express = require('express'),
          AWS = require('aws-sdk'),
      helpers = require('../src/helpers');

const router = express.Router();

AWS.config.update({region:'us-east-1'});

// Initialize AWS SDK for Personalize functions
let personalizeevents = new AWS.PersonalizeEvents();
let personalizeruntime = new AWS.PersonalizeRuntime();

let shopifyProducts;

// Saving products in memory
// since we're not using the product ID as the item id, we're unable to query shopify directly for a product 
// Instead, we're saving the products here to traverse by title
helpers.initProducts(process.env.SHOPIFY_URL).then(products => {
  shopifyProducts = products;
  console.log(shopifyProducts);
});

// Homepage Route
router.get('/', (req, res, next) => {
  res.send('Hello World - AWS Personalize demo');
});

// Endpoint to send results to Personalize
router.get('/send-events', (req, res, next)=>{
  let user = req.query.userId;
  let item = req.query.itemId;
  let category = req.query.category;
  let session = req.query.sessionId;
  console.log('[ANDREAS LOG] Incoming event!');
  let eventParams = helpers.buildEventParams(user, item, category, session);

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
      res.send('Sent event heck ya!');
    }
  });
});

let populateMetaData = (items) => {
  let populatedData = [];
  items.forEach(item => {
    let itemIndex = helpers.getIndexIfObjWithOwnAttr(shopifyProducts, 'handle', item.itemId);
    let itemData = {
        title: shopifyProducts[itemIndex].title,
        price: shopifyProducts[itemIndex].variants[0].price,
        image: shopifyProducts[itemIndex].image.src,
        url: `https://atticandbutton.com/products/${item.itemId}`,
        variantId: shopifyProducts[itemIndex].variants[0].id
      }
      populatedData.push(itemData);
    });

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