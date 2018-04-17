/*

  BB strategy - okibcn 2018-01-03
  RSI - WR  Version by zzmike76

 */
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');
var rsi = require('./indicators/RSI.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function () {
  this.name = 'BBRSI_WR';
  this.nsamples = 0;
  this.debug = true;
  this.trend = {
    zone: 'none',  // none, top, high, low, bottom
    duration: 0,
    persisted: false
  };

  var customWRSettings = {
    optInTimePeriod: this.settings.optInTimePeriod
  }
  
  this.requiredHistory = this.tradingAdvisor.historySize;

  // define the indicators we need
  this.addIndicator('bb', 'BB', this.settings.bbands);
  this.addIndicator('rsi', 'RSI', this.settings);
  this.addTulipIndicator('mywr', 'willr', customWRSettings);
}


// for debugging purposes log the last
// calculated parameters.
method.log = function (candle) {
  
  var rsi = this.indicators.rsi;
  var rsiVal = rsi.result.toFixed(2);
  var wr = this.tulipIndicators.mywr.result.result;
  
  if( this.debug ) log.debug('\t', 'RSI: ', rsiVal);
  if( this.debug ) log.debug('\t', 'WR: ' + wr);
  if( this.debug ) log.debug('\t', 'Price: ', candle.close.toFixed(2));  
}

method.check = function (candle) {
  var BB = this.indicators.bb;
  var price = candle.close;
  this.nsamples++;

  var rsi = this.indicators.rsi;
  var rsiVal = rsi.result.toFixed(2);
  var wr = this.tulipIndicators.mywr.result.result;

  // price Zone detection
  var zone = 'none';
  if (price >= BB.upper) zone = 'top';
  if ((price < BB.upper) && (price >= BB.middle)) zone = 'high';
  if ((price > BB.lower) && (price < BB.middle)) zone = 'low';
  if (price <= BB.lower) zone = 'bottom';
  if( this.debug ) log.debug('current zone:  ', zone);
  if( this.debug ) log.debug('current trend duration:  ', this.trend.duration);

  if (this.trend.zone == zone) {
    this.trend = {
      zone: zone,  // none, top, high, low, bottom
      duration: this.trend.duration+1,
      persisted: true
    }
  }
  else {
    this.trend = {
      zone: zone,  // none, top, high, low, bottom
      duration: 0,
      persisted: false
    }
  }

  if (price <= BB.lower && rsiVal <= this.settings.low && wr < this.settings.down && this.trend.duration >= this.settings.persistence) {
    this.advice('long')
    if( this.debug ) log.debug('Going long, ' + "WR: " + wr.toFixed(2) + ' RSI: ' + rsiVal );
  }
  else if (price >= BB.middle && rsiVal >= this.settings.high && wr > this.settings.up) {
    this.advice('short')
    if( this.debug ) log.debug('Going short, ' + "WR: " + wr.toFixed(2) + ' RSI: ' + rsiVal);
  }
  else {
    if( this.debug ) log.debug('Doing nothing!');
      this.advice();
    }
      
}

module.exports = method;
