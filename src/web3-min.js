const Web3 = require('web3')
const contractInfo = require('./contract.json')
const web3 = new Web3(window.ethereum);

export const getRNBContract = function() {
    const contract = new web3.eth.Contract(contractInfo.RNB.abi, contractInfo.RNB.address)
    return {
        web3,
        contract,
        contractAddress: contractInfo.RNB.address
    }
}

export const getUpCoomingContract = function() {
    const contract = new web3.eth.Contract(contractInfo.UPC.abi, contractInfo.UPC.address)
    return contract
}