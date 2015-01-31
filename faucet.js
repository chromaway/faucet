//var EurecaClient = require('eureca.io').EurecaClient;
var EurecaClient = Eureca.Client;
var client = new EurecaClient({ uri: 'http://localhost:8000/' });
//client = new EurecaClient({ uri: 'ws://localhost:8000/', prefix: 'eureca.io', retry: 3 });
var server;

var makeUriForQR = function(longAddress, optAmount) {
    var aparts = longAddress.split('@');
    var asset_id = null,
        address = '',
        separator = '?';
    if (aparts.length == 2) {
        asset_id = aparts[0];
        address = aparts[1];
    } else {
        address = aparts[0];
    }
    var uri = "bitcoin:" + address;
    if (asset_id) {
        uri = uri + separator + "asset_id=" + encodeURIComponent(asset_id);
        separator = "&";
    }
    if (optAmount) {
        uri = uri + separator + "amount=" + encodeURIComponent(optAmount);
        separator = "&";
    }
    return uri;
};


function renderAsset(data) {
  var fragment = $('#' + data.oid);
  if (fragment.size() === 0) {
    fragment = $('#asset-template').clone().removeAttr('id')
                 .attr('id', data.oid);
    fragment.appendTo('#assets');
  };

  $('.name', fragment).text(data.name);
  $('.available', fragment).text(data.available);
  $('.unconfirmed', fragment).text(data.unconfirmed);

  $('.address', fragment).text(data.address);

  $('.open-return', fragment).off('click').click(function (evt) {
    evt.preventDefault();
    var $node = $('<canvas/>');
    $('.qr-area', fragment).empty().append($node);
    var uri = makeUriForQR(data.address);
    console.log(uri);
    qr.canvas({ canvas: $node.get(0),
                value: uri,
                level: 'H',
                size: 10
              })
    $('.return-section', fragment).fadeIn();
    $(this).fadeOut();
  });


  $('.send-asset-button', fragment).off('click').click(function () {
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

  fragment.fadeOut().fadeIn()
};

client.exports.paymentComplete = function (oid) {
  $('#' + oid).find('.sending-message').text('Ok.');
};


client.exports.renderAssets = function  (assets) {
    $.each(assets, function (idx, am) {
        renderAsset(am);
    });
};

var scan = function (evt) {
  var getUserMedia;
  function hasGetUserMedia() {
    getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia || navigator.msGetUserMedia);
    return !!getUserMedia;
  }
  var errorCallback = function(e) {
    console.log('Reeeejected!', e);
  };
  if (hasGetUserMedia()) {
    getUserMedia.call(
      navigator,
      {video: true},
      function(localMediaStream) {
        
                        //var video = document.querySelector('video');
        var $video = $('#video'),
            video;
        if ($video.size() === 0) {
          $video = $(
            '<video id="video" src="" controls="" preload="" autoplay></video>')
                   .hide()
                   .appendTo('#place-for-video');
        }
        video = $video.get(0);

        video.src = window.URL.createObjectURL(localMediaStream);
        var $gCanvas = $('<canvas/>').attr('id','qr-canvas').appendTo('#place-for-video')
            , gCtx;

        function initCanvas(w,h)
        {
          gCanvas = document.getElementById("qr-canvas");
          gCanvas.style.width = w + "px";
          gCanvas.style.height = h + "px";
          gCanvas.width = w;
          gCanvas.height = h;
          gCtx = gCanvas.getContext("2d");
          gCtx.clearRect(0, 0, w, h);
        }
        initCanvas(800,600);

        var gotAnswer = function (answer) {
          $gCanvas.remove();
          $('<h2/>').text(answer).prependTo(
            '#assets');
        }

        qrcode.callback = gotAnswer;

        function captureToCanvas() {
          // if(stype!=1)
          //   return;
//          if(gUM)
          if (true)
          {
            try{
              gCtx.drawImage(video,0,0);
              try{
                qrcode.decode();
              }
              catch(e){       
                console.log(e);
                setTimeout(captureToCanvas, 500);
              };
            }
            catch(e){       
              console.log(e);
              setTimeout(captureToCanvas, 500);
            };
          }
        }

        window.setTimeout(captureToCanvas,1000);

      // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
      // See crbug.com/110938.
        
      // video.onloadedmetadata = function(e) {
      //   // Ready to go. Do some stuff.
      // };
    }, errorCallback);
    
  } else {
    alert('Your browser does not support scanning. (camera capture)');
  }
};

var init = function() {
    //createWallet();

  $('#scan-button').click(scan);


  client.ready(function (proxy) {
    proxy.hello();
    server = proxy;
  });

};

$(document).ready(init);