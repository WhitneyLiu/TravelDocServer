const express = require('express');
const cors = require('cors');


const app = express();

// parse json request body
app.use(express.json({ limit: '10mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());


module.exports = app;