const express = require('express'),
      app = express(),
      bodyParser = require('body-parser');

app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = app;
