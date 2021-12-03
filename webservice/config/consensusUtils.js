const axios = require('axios'); 
const db = require("../models");

const TENDERMINT_URL = process.env.TENDERMINT_URL ;

exports.sendTxData = async(requestMethod, apiInfo, requestURL, requestData, responseData) => {
    // 1. Prepare tx data to send  
    // requestData.requestTime = new Date()
    const SERVER_INFO = process.env.SERVER_INFO;
    const txBody = {
        serverInfo: SERVER_INFO,
        requestURL: requestURL,
        requestMethod: requestMethod,
        apiInfo: apiInfo,
        requestTime: new Date(),
        requestData: requestData,
        responseData: responseData
    }
    
    // 2. Call Consensus
    const tendermintResponse = await callConsensus(txBody);
    return tendermintResponse;
    // customerId = -1;
    // if (!!responseData && !!responseData.id) {
    //     customerId = responseData.id
    // }
    // console.log('customerId ', customerId)
    
    // if(!!response.error) {
    //     // Delete the created customer as tendermint rejected the transaction
    //     await rollbackCustomer(customerId)
    //     return {
    //         err: "Tendermint error",
    //         errMessage: response.error.message,
    //         errData:response.error.data
    //     }
    // }

    // // If no error, send the response Data of Webservice
    // if(!!response.result && !!response.result.height) {
    //     if (customerId == -1) { // GET request method
    //         return {
    //             webserviceData: responseData,
    //             consensusData: {
    //                 height: response.result.height
    //             }
    //         }
    //     }
    //     const update = await Customer.update(
    //         { blockHeight: response.result.height },
    //         { where: { id: customerId } }
    //     );
    //     if(!update) {
    //         // Delete the created customer as cannot update Customer with block height
    //         rollbackCustomer(customerId)
    //         return {
    //             err: "Update customer",
    //             errMessage: "Error when updating Customer with block height",
    //         }
    //     }
    //     const updatedCustomer = await Customer.findByPk(customerId);
    //     return {
    //         webserviceData : updatedCustomer,
    //         consensusData: {
    //             height: response.result.height
    //         }
    //     }
    // } 
    // // Delete the created customer as tendermint rejected the transaction
    // await rollbackCustomer(customerId)
    // return {
    //     err: "Tendermint error",
    //     errMessage: "Request data is incorrectly formatted",
    // }
    // ============================== END CALL CONSENSUS ============================== 
}

callConsensus = async(txBody) => {
    const objJsonStr = JSON.stringify(txBody);
    const buff = Buffer.from(objJsonStr, 'utf-8');
    const objJsonB64 = buff.toString('base64');
    console.log('callConsensus txBody ', txBody)
    const response = await axios({
                url: TENDERMINT_URL + '/broadcast_tx_commit',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    tx : `"${objJsonB64}"`,
                    id: 0011
                },
              })
    console.log('response ', response)
    return response.data;
}

