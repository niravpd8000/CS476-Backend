const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const awsUpload = require("./awsUpload");

module.exports = {
    awsUpload,
    authJwt,
    verifySignUp
};
