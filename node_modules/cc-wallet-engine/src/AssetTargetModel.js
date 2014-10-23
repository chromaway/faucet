//var bitcoin = require('coloredcoinjs-lib').bitcoin

/**
 * @class AssetTargetModel
 * @param {cc-wallet-core.asset.AssetTarget} assetTarget
 */
function AssetTargetModel(assetTarget) {
  this.address = "FIXME get address"
  //Todo
  //var script = bitcoin.Script.fromBuffer/Hex(assetTarget.getScript())
  //var net = bitcoin.networks.testnet; // TODO wher to get current network?
  //this.address = bitcoin.Address.fromOutputScript(script, net).toBase58Check()

  var asset = assetTarget.getAsset()
  var value = assetTarget.getValue()
  this.formattedValue = asset.formatValue(value)
  this.assetMoniker = asset.getMonikers()[0]
}

/**
 * @return {?}
 */
AssetTargetModel.prototype.getAddress = function() {
  return this.address
}

/**
 * @return {string}
 */
AssetTargetModel.prototype.getAssetMoniker = function() {
  return this.assetMoniker
}

/**
 * @return {string}
 */
AssetTargetModel.prototype.getFormattedValue = function() {
  return this.formattedValue
}


module.exports = AssetTargetModel
