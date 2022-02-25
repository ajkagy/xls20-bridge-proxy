const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
const path = require('path')
var http = require("http");
var https = require("https");
const { XummSdk } = require("xumm-sdk");
var cors = require("cors");
const bodyParser = require("body-parser");
const xrpl = require("xrpl");
const rateLimit = require('express-rate-limit');
const Contract = require("web3-eth-contract");
require("dotenv").config();

const erc721abi = fs.readFileSync(path.resolve(__dirname, 'erc721.json'), 'utf8')

// Create Express Server
const app = express();
var whitelist = [process.env.WHITELIST_URL];
var corsOptions = {
  origin: function (origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Configuration
const PORT = process.env.API_SERVICE_PORT;
const API_SERVICE_URL = process.env.API_SERVICE_URL;

var privateKey = fs.readFileSync(process.env.SSL_PRIV_KEY_PATH, "utf8");
var certificate = fs.readFileSync(process.env.SSL_CERT_PATH, "utf8");
var credentials = { key: privateKey, cert: certificate };
// Proxy endpoints
app.use("/api/xls20bridge/**", [
  customValidation,
  createProxyMiddleware({
    target: {
      protocol: "https:",
      host: process.env.BRIDGE_MASTER_PROCESS_RPC,
      path: "/",
      port: process.env.BRIDGE_MASTER_PROCESS_RPC_PORT,
      cert: certificate,
      key: privateKey,
    },
    changeOrigin: true,
    onProxyReq,
  }),
]);

function onProxyReq(proxyReq, req, res) {
  // add custom header to request
  try {
    proxyReq.setHeader("x-api-key", process.env.BRIDGE_MASTER_PROCESS_API_KEY);
  } catch {}
  // or log the req
}

function customValidation(req, res, next) {
  try {
    if (req.get("origin") == process.env.WHITELIST_URL) {
      next();
    } else {
      res.status(401).send("UnAuthorized");
    }
  } catch {
    res.status(401).send("UnAuthorized");
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/eth/getTokenUri", async function (req, res, next) {
  try {
    let contractAddress = req.body.contractAddress;
    let tokenID = req.body.tokenId;
    Contract.setProvider(process.env.ETH_ENDPOINT);
    var TokenContract = new Contract(JSON.parse(erc721abi), contractAddress);
    await TokenContract.methods
      .tokenURI(tokenID)
      .call()
      .then(async function (result) {
        console.log(result);
        res.send({tokenuri: result});
      });
  } catch(err) {
    console.log(err)
  }
});

app.use("/eth/isApprovedForAll", async function (req, res, next) {
  try {
    let contractAddress = req.body.contractAddress;
    let ownerAddress = req.body.ownerAddress;
    let operatorAddress = req.body.operatorAddress;
    Contract.setProvider(process.env.ETH_ENDPOINT);
    var TokenContract = new Contract(JSON.parse(erc721abi), contractAddress);
    await TokenContract.methods
      .isApprovedForAll(ownerAddress,operatorAddress)
      .call()
      .then(async function (result) {
        res.send({isApproved: result});
      });
  } catch(err) {console.log(err);}
});

app.use("/xumm/createpayload", async function (req, res, next) {
  try {
    const Sdk = new XummSdk(
      process.env.XUMM_API_KEY,
      process.env.XUMM_API_SECRET
    );
    const payload = await Sdk.payload.create(req.body, true);
    res.send(payload);
  } catch {}
});

app.use("/xumm/getpayload", async function (req, res, next) {
  try {
    const Sdk = new XummSdk(
      process.env.XUMM_API_KEY,
      process.env.XUMM_API_SECRET
    );
    const payload = await Sdk.payload.get(req.body.payloadID);
    res.send(payload);
  } catch {}
});

//Rate Limiting
const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const apiLimiter10 = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 10, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter)
app.use('/eth', apiLimiter10)
app.use('/xumm', apiLimiter10)

// your express configuration here
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT);
