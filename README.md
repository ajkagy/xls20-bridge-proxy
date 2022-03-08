# xls20-bridge-proxy
Express.js proxy between the UI and Master Process

### Requirements

+ [NodeJs](https://nodejs.org/en/)
+ [Git](https://git-scm.com/downloads)
+ [Infura Account](https://infura.io/)
+ [Xumm Dev Account](https://apps.xumm.dev/)

## Getting Started

1. Create an [Infura Account](https://infura.io/), Create a new project, then make note of the Rinkeby https endpoint.
2. Create a [Xumm Dev Account](https://apps.xumm.dev/). Create a new App, then make note of the API Key and API Secret.


## Installation

Open a command prompt or Powershell prompt and issue the following commands

```
git clone https://github.com/ajkagy/xls20-bridge-proxy
```

1. in the root of the xls20-bridge-proxy directory create a new .env file and add the following text:

        API_SERVICE_URL=http://192.168.0.133
        API_SERVICE_PORT=9999
        SSL_PRIV_KEY_PATH=/etc/privkey.pem
        SSL_CERT_PATH=/etc/fullchain.pem
        WHITELIST_URL=bridge.xrplive.com
        BRIDGE_MASTER_PROCESS_RPC=192.168.0.133
        BRIDGE_MASTER_PROCESS_RPC_PORT=63900
        BRIDGE_MASTER_PROCESS_API_KEY=7a82091d-3351-492b-9e38-3913b9ed3cc2
        XUMM_API_KEY=
        XUMM_API_SECRET=
        ETH_ENDPOINT=https://rinkeby.infura.io/[Add your Infura Account URL]

2. Replace the environement variables with your own set values.
    - `API_SERVICE_URL` is the url of your proxy service. This will be http or https depending on which proxy you're running.(`http.js` or `https.js`)
    - `API_SERVICE_PORT` is your port the proxy service will run on
    - `SSL_PRIV_KEY_PATH` path to your private cert key (only applies when running https)
    - `SSL_CERT_PATH` path to your https cert (only applies when running https)
    - `WHITELIST_URL` CORS whitelist URL. This is the url that the [Bridge Web App](https://github.com/ajkagy/xls20-bridge-webapp) will run on
    - `BRIDGE_MASTER_PROCESS_RPC` [Bridge Master Process](https://github.com/ajkagy/xls20-bridge-master) IP/Domain
    - `BRIDGE_MASTER_PROCESS_RPC_PORT` [Bridge Master Process](https://github.com/ajkagy/xls20-bridge-master) Port
    - `BRIDGE_MASTER_PROCESS_API_KEY` a random guid generated that will secure the bridge master process API
    - `XUMM_API_KEY` API Key for your new XUMM app you created in Step 1 in the Getting Started section.
    - `XUMM_API_SECRET` API Secret for your new XUMM app you created in Step 1 in the Getting Started section.
    - `ETH_ENDPOINT` The Infura Rinkeby https url from Step 1 in the Getting Started section.

3. Install

        npm install

4. Start the proxy

      -  `node https.js` for SSL enabled
      -  `node http.js` for SSL disabled
