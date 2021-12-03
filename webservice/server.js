require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
// const mysql = require('mysql');

const app = express();

const TENDERMINT_URL = process.env.TENDERMINT_URL;

var corsOptions = {
  origin: TENDERMINT_URL
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// call sysc()
const db = require("./models");
db.sequelize.sync();

// simple route
const INFO = process.env.SERVER_INFO || 0;
app.get("/test", (req, res) => {
  res.json({ message: "Welcome to our application " + INFO});
});

// customer routes
const customerRouter = require('./routes/customerRoute');
app.use('/customers', customerRouter);

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log('DEBUG')
});       
