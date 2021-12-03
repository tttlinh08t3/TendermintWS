const express = require('express');
const router = express.Router();
const synchronization = require("../controllers/synchronizationController");

router.post("/", synchronization.syncData);

module.exports = router;