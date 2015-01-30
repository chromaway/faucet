//var EurecaClient = require('eureca.io').EurecaClient;
var EurecaClient = Eureca.Client;
var client = new EurecaClient({ uri: 'http://localhost:8000/' });
//client = new EurecaClient({ uri: 'ws://localhost:8000/', prefix: 'eureca.io', retry: 3 });
var server;

function renderAsset(data) {
  
  var fragment = $('#asset-template').clone().removeAttr('id')
                 .attr('id', data.oid);
  fragment.appendTo('#assets');    
  $('.name', fragment).text(data.name);
  $('.available', fragment).text(data.available);
  $('.unconfirmed', fragment).text(data.unconfirmed);
  $('.address', fragment).text(data.address);

  $('.send-asset-button', fragment).click(function () {
    var sendAddress = $('input.send-address', fragment).val();
    var sendAmount = $('input.send-amount', fragment).val();
    
    server.send(data.oid, sendAddress, sendAmount)
    .onReady(function (result) {
      if (result.error) {
        alert(result.error);
      } else {
        var $sending = $('<p class="sending-message">Sending...</p>')
                       .appendTo($('.send-form', fragment));
      }
    });
  });
};

client.exports.paymentComplete = function (oid) {
  $('#' + oid).find('.sending-message').text('Ok.');
};


client.exports.renderAssets = function  (assets) {
    $('#assets').empty().hide();
    $.each(assets, function (idx, am) {
        renderAsset(am);
    });
    $('#assets').fadeIn();
};

var init = function() {
    //createWallet();


  client.ready(function (proxy) {
    proxy.hello();
    server = proxy;
  });

};

$(document).ready(init);