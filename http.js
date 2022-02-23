const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");
var http = require("http");
var https = require("https");
const { XummSdk } = require("xumm-sdk");
var cors = require("cors");
const bodyParser = require("body-parser");
const xrpl = require("xrpl");
require("dotenv").config();

// Create Express Server
const app = express();
app.use(cors());
// Configuration
const PORT = process.env.API_SERVICE_PORT;
const API_SERVICE_URL = process.env.API_SERVICE_URL;

// Proxy endpoints
app.use("/api/xls20bridge/**", [
  customValidation,
  createProxyMiddleware({
    target: {
      protocol: "http:",
      host: process.env.BRIDGE_MASTER_PROCESS_RPC,
      path: "/",
      port: process.env.BRIDGE_MASTER_PROCESS_RPC_PORT,
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
    next();
  } catch {
    res.status(401).send("UnAuthorized");
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/xumm/createpayload", async function (req, res, next) {
  try {
    console.log(req.body);
    const Sdk = new XummSdk(
      process.env.XUMM_API_KEY,
      process.env.XUMM_API_SECRET
    );
    const payload = await Sdk.payload.create(req.body, true);
    res.send(payload);
  } catch (err) {
    console.log(err);
  }
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

// your express configuration here

var httpServer = http.createServer(app);

httpServer.listen(PORT);
