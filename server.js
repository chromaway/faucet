var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app)
  , ccWalletEngine = require('cc-wallet-engine')
  , EurecaServer = require('eureca.io').EurecaServer
  , eurecaServer = new EurecaServer({allow: ['renderAssets','paymentComplete']})

var wallet,
mnemonic = "you video scan pipe roof ridge comic cannon aspect girl hobby wait", // Create by wallet.generateMnemonic();
password = 'lorem ipsum', pin = '1234',
systemAssetDefinitions = [{
        monikers: ['gold'],
        colorDescs: ['epobc:b95323a763fa507110a89ab857af8e949810cf1e67e91104cd64222a04ccd0bb:0:180679']
    }, {
// Asset definition from desktop chromawallet:
//   {"color_set": ["epobc:0261b29b587020eeca15f831a5290a9d81038851da4365689be04e588ce58c66:0:303510"], "monikers": ["euro"], "unit": 100}
        "colorDescs": ["epobc:0261b29b587020eeca15f831a5290a9d81038851da4365689be04e588ce58c66:0:303510"],
        "monikers": ["euro"], 
        "unit": 100
    }
],
walletOptions = {
    testnet: true, 
    systemAssetDefinitions: systemAssetDefinitions
};

var objReg = {}, glbOid = 1, assetModels = [], clientIds = [];
var saveObj = function (obj, optOid) {
  if (!optOid) {
    glbOid = glbOid + 1
    optOid = glbOid
  }
  objReg[optOid] = obj
  return optOid
}

var getObj = function (oid) {
  return objReg[oid]
}

var renderAssetModelsToClient = function (client) {
  var serialized = assetModels.map(function (am) {
    var name = am.getMoniker()
      , oid = saveObj(am, name)
      , data = {
        name : name,
        available : am.getAvailableBalance(),
        unconfirmed : am.getUnconfirmedBalance(),
        address : am.getAddress(),
        oid: name
      };
    return data;
  });

  try {
    client.renderAssets(serialized);
  } catch (e) {
    console.error(e);
  }
  
  //Send to client
}
//eurecaServer.exports.

eurecaServer.onConnect(function (connection) {
  console.log('new Client', connection.id);
  var id = connection.id;
  clientIds.push(id);
  var client = eurecaServer.getClient(id);
  
  renderAssetModelsToClient(client);
    
});

function walletWasUpdated() {
  console.log("Wallet was updated!");
  assetModels = wallet.getAssetModels();
  console.log(assetModels);
  console.log(clientIds);
  clientIds.forEach(function (id) {
    console.log("Transmitting to client:" + id);
    var client = eurecaServer.getClient(id);
    renderAssetModelsToClient(client);
  });
};

function createWallet() {
  wallet = new ccWalletEngine(walletOptions);
  if (!wallet.canResetSeed()) {
    wallet.initialize(mnemonic, password, pin);        
  } else {
    wallet.resetSeed(password);
  }

  wallet.setCallback(walletWasUpdated);
};


eurecaServer.attach(server)

createWallet();

eurecaServer.exports.hello = function () {
  console.log('Hello from client');
}

eurecaServer.exports.scanAndSend = function (uri) {
  var context = this,
      response = {}
  context.async = true
  try {
    wallet.makePaymentFromURI(uri, function (err, payment) {
      if (err)
        throw err
      var onPaymentComplete = function (err, txid) {
        if (err)
          throw err
        response.ok = "Sent ok"
        context.return(null, response);
      }
      try {
        payment.send(onPaymentComplete);
      }
      catch (e){
        context.return(e.toString(), response);
      }
    });
  } catch (e) {
    console.log(e);
    context.return(e.toString(), response);
  }
}

eurecaServer.exports.send = function (oid, address, amount) {
  try {
    var am = getObj(oid)
      , error
      , progress
      , paymentModel = am.makePayment()
    if (!paymentModel.checkAddress(address)) {
      error = 'Invalid address:' + address;
    } else if (!paymentModel.checkAmount(amount)) {
      error = 'Wrong amount:' + amount;
    } else {
      paymentModel.addRecipient(address, amount);
      var connId = this.connection.id;
      var onPaymentComplete = function () {
        var client = eurecaServer.getClient(connId);
        client.paymentComplete(oid);
      };
      paymentModel.send(onPaymentComplete);
    }
    return {
      error: error
    }
  } catch (e) {
    return {
      error: e.msg
    }
  }
};

app.use('/bower_components',
        express.static(__dirname + '/bower_components'))

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html')
})
app.get('/logo.png', function (req, res, next) {
  res.sendFile(__dirname + '/logo.png')
})
app.get('/faucet.css', function (req, res, next) {
  res.sendFile(__dirname + '/faucet.css')
})
app.get('/faucet.js', function (req, res, next) {
  res.sendFile(__dirname + '/faucet.js')
})
 
server.listen(8000)