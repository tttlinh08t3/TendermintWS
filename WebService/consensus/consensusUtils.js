const axios = require('axios'); 
const TENDERMINT_URL_NODE0 = "http://localhost:26657" // P2P : 26656 
//const TENDERMINT_URL_NODE1 = "http://localhost:26660" // P2P : 26659 
//const TENDERMINT_URL_NODE2 = "http://localhost:26662" // P2P : 26661
// const TENDERMINT_URL_NODE3 = "http://localhost:26664" // P2P : 26663
// const TENDERMINT_URL_NODE4 = "http://localhost:26666" // P2P : 26665 // not running

exports.sendTxData = async(type, method, requestData, responseData) => {
    // 1. Prepare tx data to send
    requestData.requestTime = new Date()
    const api = {
        type: type,
        method: method
    }
    const txBody = {
        api: api,
        requestData: requestData,
        responseData: responseData
    }
    
    // 2. Call Consensus
    const response = await callConsensus(txBody);

    if(!!response.error) {
        return "Error message from Tendermint: " + response.error.message + ", error data: " + response.error.data;
    }
    // If no error, send the response Data of Webservice
    if(!!response.result && !!response.result.height)
        responseWS = {
            webserviceData : responseData,
            consensusData: {
                height: response.result.height
            }
    }
    return responseWS;
    // ============================== END CALL CONSENSUS ============================== 
}

callConsensus = async(txBody) => {
    const objJsonStr = JSON.stringify(txBody);
    const buff = Buffer.from(objJsonStr, 'utf-8');
    const objJsonB64 = buff.toString('base64');

    // console.log('objJsonB64 ', objJsonB64)
    const response = await axios({
                url: TENDERMINT_URL_NODE0 + '/broadcast_tx_commit',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                params: {
                    tx : `"${objJsonB64}"`,
                    id: 0011
                },
              })
    return response.data;
}