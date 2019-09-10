'use strict'
const rp = require('request-promise');

module.exports = {
  // function to fetch products
  initProducts: (url) => {
    console.log('calling init products')
    let promiseObj = new Promise((resolve, reject) => {
      // Setup options to make GET request
      let options = {
        uri: url,
        json: true
      };

      // Fetch products from shopify and return as array
      rp(options).then((products) => {
        let shopifyProducts = products.products;
        resolve(shopifyProducts);
    });  
    })
    return promiseObj
    
  },

 //  // Function to traverse objects in array to return the index of that object
  getIndexIfObjWithOwnAttr: (array, attr, value) => {
    for(var i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  },

  buildEventParams: (userID, itemID, category, session) => {
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
  },

  populateMetaData: (items) => {
    let populatedData = [];
    console.log('populating meta data');
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

}