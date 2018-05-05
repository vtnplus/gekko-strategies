// BB strategy - okibcn 2018-01-03 with Stop Loss - Crypto49er 2018-05-03
// helpers

var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');
var rsi = require('./indicators/RSI.js');

var advised = false;
var buyPrice = 0.0;

var method = {};

method.init = function () {
 this.name = 'BB';
 this.nsamples = 0;
 this.debug = false;
 this.trend = {
  zone: 'none',  // none, top, high, low, bottom
  duration: 0,
  persisted: false
 };
 
 this.requiredHistory = this.tradingAdvisor.historySize;
 this.addIndicator('bb', 'BB', this.settings.bbands);
 this.addIndicator('rsi', 'RSI', this.settings);
}

method.log = function (candle) {
}

method.check = function (candle) {
 var BB = this.indicators.bb;
 var price = candle.close;
 this.nsamples++;
 
 var rsi = this.indicators.rsi;
 var rsiVal = rsi.result;

 // price Zone detection
 var zone = 'none';
 if (price >= BB.upper) zone = 'top';
 if ((price < BB.upper) && (price >= BB.middle)) zone = 'high';
 if ((price > BB.lower) && (price < BB.middle)) zone = 'low';
 if (price <= BB.lower) zone = 'bottom';
 if(this.debug) {
  log.debug('current zone:  ', zone);
  log.debug('current trend duration:  ', this.trend.duration);
  }
 
 if (this.trend.zone == zone) {
  this.trend = {
   zone: zone,  // none, top, high, low, bottom
   duration: this.trend.duration+1,
   persisted: true
  }
 } else {
  
  this.trend = {
   zone: zone,  // none, top, high, low, bottom
   duration: 0,
   persisted: false
  }
 }
 
 if (!advised && price <= BB.lower && rsiVal <= this.settings.thresholds.low && this.trend.duration >= this.settings.thresholds.persistence) {
  if(this.debug) {
   log.debug(candle.start);
   log.debug('RSI', rsiVal);
   log.debug('buy price', candle.close);
  }
  this.advice('long');
  advised = true;
  buyPrice = candle.close;
 }
 
 if (advised && buyPrice > candle.close * (1 + this.settings.stoploss.percentage * .01)){
  if(this.debug) {
   log.debug("Stop loss triggered, sell at", candle.close);
   log.debug(candle.start);
   log.debug('RSI', rsiVal);
   log.debug('sell price', candle.close);
  }
  this.advice('short');
  advised = false;
 }
 
 if (advised && price >= BB.middle && rsiVal >= this.settings.thresholds.high) {
  this.advice('short');
  advised = false;
 }
}
module.exports = method;
