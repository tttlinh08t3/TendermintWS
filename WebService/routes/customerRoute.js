const express = require('express');
const router = express.Router();
const customers = require("../controllers/customerController");

// Create a new Customer
router.post("/", customers.createNewCustomer);
// router.get("/", customers.getInfo);
router.get("/all", customers.getAll);

module.exports = router;