const db = require("../models");
const consensusUtils = require("../consensus/consensusUtils")
const Customer = db.Customer;

// API to synchronize data between domains
exports.syncData = async function (req, res) {
    // Validate request
    if (!req.body.api || !req.body.requestData) {
      res.status(400).send({
        message: "api or request data can not be empty!"
      });
      return;
    }
    // if (req.query.length == 0 || !req.query.consensus) {
    //     res.status(400).send({
    //       message: "Query param consensus is required"
    //     });
    //     return;
    // }
    // const with_consensus = req.query.consensus; // Consensus = 1 => calling WS with consensus. Otherwise, calling WS without consensus
    // Create a Customer
    // const newCustomer = {
    //     name: req.body.name,
    //     email: req.body.email,
    //     address: req.body.address
    // };
    const requestData = req.body.requestData
    
    try{
        const createdResponse = await Customer.create(newCustomer);
        if(with_consensus == 1){
            // ============================== CALL CONSENSUS BEFORE RESPONSE DATA =============== 
            const data = await consensusUtils.sendTxData("POST", "Create New Customer", newCustomer, createdResponse);   
            res.send(data);
            
        } else {
            
            const responseWS = {
                webserviceData : createdResponse,
                consensusData: null,
            }  
            res.send(responseWS);
        }
       
    } catch(err){
        res.status(500).send({
            message: err.message || "Error create CUSTOMER"
    });
    }
};
