'use strict'

// Libraries
const express = require('express'),
       routes = require('./routes'),
         cors = require('cors');

// Setting up app
const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 8080;

app.use(cors())

app.use('/', routes);

// Starting server
app.listen(PORT, HOST);

console.log(`Example App Running on http://${HOST}:${PORT}`);

module.exports = app;