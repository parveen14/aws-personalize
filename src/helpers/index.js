'use strict'
const rp = require('request-promise');

module.exports = {

 //  // Function to traverse objects in array to return the index of that object
  getIndexIfObjWithOwnAttr: (array, attr, value) => {
    for(var i = 0; i < array.length; i++) {
      if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  },

  buildEventParams: (userID, session) => {
    let itemProps = {
      itemId:'11',
      eventValue:1,
    };

    let params = {
      sessionId: session,
      trackingId: process.env.TRACKING_ID,
      userId: userID,
      eventList: [ 
        { 
          sentAt: Date.now(),
          eventType: 'PAGE_CLICKED',
          properties: itemProps,
        },
      ],
    };

    return params;
  },

}