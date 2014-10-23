How to create a little project that uses the chromaway libraries

A faucet, a page that you can use to get various colored-coins on
testnet. Basically an open wallet you can send and receive from.

1. Create a file called package.json and put in a new empty folder

    {
      "name": "cc-faucet",
      "version": "0.1.0",
      "repository": {
          "type": "git",
          "url": "git://github.com/chromaway/cc-faucet.git"
      },
      "dependencies": {
        "cc-wallet-engine": "git://github.com/chromaway/cc-wallet-engine.git"
      }
    }

2. Run this command:
   
    npm install -g grunt-cli

    npm install

    cd node_modules/cc-wallet-engine/
    
    npm install

    grunt compile

    
In the folder node_modules/cc-wallet-engine there should now be a file
named cc-wallet-engine.js


3. Create a simple html page, and include some javascript.


4. Start a local webserver, such as with this command:

    python -m SimpleHTTPServer 8888

5. Add your code in faucet.js. The code is only 99 lines long, and
hopefully easy to follow. It just uses plain jQuery and the
cc-wallet-engine

6. Issue something with chromawallet, copy as json and paste into
systemAssetDefintions. color_set should be renamed colorDescs.








