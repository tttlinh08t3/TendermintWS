const db = require("../models");
const consensusUtils = require("../consensus/consensusUtils")
const Customer = db.Customer;

// API to create new Customers Info in DB
exports.createNewCustomer = async function (req, res) {
    // Validate request
    if (!req.body.name || !req.body.email || !req.body.address) {
      res.status(400).send({
        message: "Name or Email or Address can not be empty!"
      });
      return;
    }
    if (req.query.length == 0 || !req.query.consensus) {
        res.status(400).send({
          message: "Query param consensus is required"
        });
        return;
    }
    const with_consensus = req.query.consensus; // Consensus = 1 => calling WS with consensus. Otherwise, calling WS without consensus
    // Create a Customer
    const newCustomer = {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        blockHeight: req.body.blockHeight || null
    };
    try{
        const createdResponse = await Customer.create(newCustomer);
        if(with_consensus == 0) {
            console.log("Connect to " + process.env.SERVER_INFO + " without consensus");
            const responseWS = {
                webserviceData : createdResponse,
                consensusData: null,
            }  
            res.status(201).send(responseWS);
            return;
        }
        
        // ============================== CALL CONSENSUS BEFORE RESPONSE DATA =============== 
        const tendermintResponse = await consensusUtils.sendTxData("POST", "Create New Customer", "customers", newCustomer, createdResponse);  
        if (!!createdResponse && !!createdResponse.id) {
            customerId = createdResponse.id
        }
        console.log('customerId ', customerId)
        
        if(!!tendermintResponse.error) {
            // Delete the created customer as tendermint rejected the transaction
            await rollbackCustomer(customerId);
            res.status(400).send({
                err: "Tendermint error",
                errMessage: tendermintResponse.error.message,
                errData:tendermintResponse.error.data
            })
            return;
        }

        // If no error, send the response Data of Webservice
        if(!!tendermintResponse.result && !!tendermintResponse.result.height) {
            const update = await Customer.update(
                { blockHeight: tendermintResponse.result.height },
                { where: { id: customerId } }
            );
            if(!update) {
                // Delete the created customer as cannot update Customer with block height
                rollbackCustomer(customerId)
                res.status(400).send({
                    err: "Update customer",
                    errMessage: "Error when updating Customer with block height",
                })
                return;
            }
            const updatedCustomer = await Customer.findByPk(customerId);
            res.status(201).send({
                webserviceData : updatedCustomer,
                consensusData: {
                    height: tendermintResponse.result.height
                }
            })
            return;
        } 
        // Delete the created customer as tendermint rejected the transaction
        await rollbackCustomer(customerId)
        res.status(400).send({
            err: "Tendermint error",
            errMessage: "Request data is incorrectly formatted",
        })
        return; 
        
    } catch(err){
        res.status(500).send({
            message: err.message || "Error create CUSTOMER"
    });
    }
};

// API to get all Customers in DB
exports.getAll = async function (req, res) {
    // Validate request
    if (req.query.length == 0 || !req.query.consensus) {
        res.status(400).send({
          message: "Query param consensus is required"
        });
        return;
    }
    const with_consensus = req.query.consensus; // Consensus = 1 => calling WS with consensus. Otherwise, calling WS without consensus
    try{
        const responseInfo = await Customer.findAll();
        if(!responseInfo) {
            responseInfo = { message: "No customers exist"}
        }
        if(with_consensus == 0) {
            console.log("Connect to " + process.env.SERVER_INFO + " without consensus");
            res.status(200).send({
                webserviceData : responseInfo,
                consensusData: null,
            });
            return;
        }
        
        // ============================== CALL CONSENSUS BEFORE RESPONSE DATA =============== 
        const tendermintResponse = await consensusUtils.sendTxData("GET", "Get All Customers", "customers", null, responseInfo);     
        if(!!tendermintResponse.error) {
            // Delete the created customer as tendermint rejected the transaction
            res.status(400).send({
                err: "Tendermint error",
                errMessage: tendermintResponse.error.message,
                errData:tendermintResponse.error.data
            })
            return;
        }
        if(!!tendermintResponse.result && !!tendermintResponse.result.height) {
            res.status(200).send({
                webserviceData: responseInfo,
                consensusData: {
                    height: tendermintResponse.result.height
                }
            })
            return;
        }
    } catch(err){
        res.status(500).send({
            message: err.message || "Error retrieving Customer "
    });
    }
};

rollbackCustomer= async(customerId) => {
    const deletedRecord = await Customer.destroy({
        where: {
            id: customerId
        }
    })
    if (deletedRecord === 1) {
        console.log("Tendermint rejected the transaction. Rolled back the created customer sucessfully")
    }
}
