var wallet, //global vars so you can experiment interactively in developer tools
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

function renderAsset(am) {
    var data = {
        name : am.getMoniker(),
        available : am.getAvailableBalance(),
        unconfirmed : am.getUnconfirmedBalance(),
        address : am.getAddress()
    },
    fragment = $('#asset-template').clone().removeAttr('id');;
    fragment.appendTo('#assets');    
    $('.name', fragment).text(data.name);
    $('.available', fragment).text(data.available);
    $('.unconfirmed', fragment).text(data.unconfirmed);
    $('.address', fragment).text(data.address);

    $('.send-asset-button', fragment).click(function () {
        var sendAddress = $('input.send-address', fragment).val();
        var sendAmount = $('input.send-amount', fragment).val();
        var paymentModel = am.makePayment();
        if (!paymentModel.checkAddress(sendAddress)) {
            alert('Invalid address:' + sendAddress);
            return;
        }
        if (!paymentModel.checkAmount(sendAmount)) {
            alert('Wrong amount:' + sendAmount);
            return;
        }
        paymentModel.addRecipient(sendAddress, sendAmount);

        var $sending = $('<p class="sending-message">Sending...</p>')
            .appendTo($('.send-form', fragment));

        var onPaymentComplete = function () {
            $sending.text('Ok.');
        };
        paymentModel.send(onPaymentComplete);
    });

};

function render () {
    $('#assets').empty().hide();
    var assetModels = wallet.getAssetModels();
    $.each(assetModels, function (idx, am) {
        renderAsset(am);
    });
    $('#assets').fadeIn();
};

function walletWasUpdated() {
    console.log("Wallet was updated!");
    render();
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

var init = function() {
    createWallet();
};

$(document).ready(init);