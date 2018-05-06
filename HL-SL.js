// HL by mounirlabaied and stoploss by crypto49er

var method = {};

method.init = function() {
  this.name = 'Scalper';

  this.Period = Math.round(this.settings.Period);
  this.candle_queue = [];
  this.is_buyin = false;
  var advised = false;
  var buyPrice = 0.0;
}

var barscount = 0;
var DarvasHigh = 0;
var DarvasLow = 0;

method.update = function(candle) {
  
  if(candle.low < DarvasLow){DarvasLow = candle.low;}
  if(candle.high < DarvasHigh){DarvasHigh = candle.low;}

  this.candle_queue.push(candle);
  barscount++;
  if(this.candle_queue.length>0){
    candle.delta = candle.close - this.candle_queue[0].close;
  }

}

var Period = this.Period;
var Min = [];
var MovingTR = [];
var NoTradedSince = 0;
IsReversalUp = function(min,candle){

  var c1 = this.candle_queue[this.candle_queue.length -2];
  return (candle.low < min && candle.close > c1.close);
}

var MoveCycle = [];
var LowTopDif = [];
method.check = function(candle) {
  if (this.candle_queue.length >= this.Period) {
    
    //Get Min Max
    runningMin = 99999999;
    runningMax = 0;
    for (let barsBack = Math.min(this.candle_queue.length, this.Period - 1); barsBack > 0; barsBack--)
    {
      var bar = this.candle_queue[barsBack];
      if(bar.close <= runningMin)
      {
        runningMin  = bar.close;
      }
    }
    Min.push(runningMin);

    for (let barsBack = Math.min(this.candle_queue.length, this.Period - 1); barsBack > 0; barsBack--)
    {
      var bar = this.candle_queue[barsBack];
      if(bar.close >= runningMax)
      {
        runningMax  = bar.close;

      }
    }
    //Get Min Max EOF

    var CandeLow = this.candle.close < runningMin && (this.candle.close - runningMin) / 100;
    MoveCycle.push((this.candle.close - runningMin) / 100);

    var c1 = this.candle_queue[this.candle_queue.length -2];
    var TrueRange = Math.max(runningMax,c1.close) - Math.min(runningMin,c1.close);
    var valid = TrueRange / (candle.close - c1.close);
    MovingTR.push(valid);

    LowTopDif.push((runningMin - runningMax) / 100);

    if(CandeLow   && valid > 0 &&! this.is_buyin)
    {
      this.candle_queue.length = 0;
      runningMin = 0;
      runningMax = 0;
      Min = [];
      MovingTR = [];
      this.is_buyin = true;
      return this.advice("long");
    }
    else if (candle.close >= runningMax && this.is_buyin  )
    {
      this.candle_queue.length = 0;
      runningMin = 0;
      runningMax = 0;
      Min = [];
      MovingTR = [];
      this.is_buyin = false;
      return this.advice("short");
    }
    if(NoTradedSince > 2 &&! this.is_buyin)
    {
      this.candle_queue.length = 0;
      runningMin = 0;
      Min = [];
      runningMax = 0;
      MovingTR = [];
      NoTradedSince = 0;
    }
    NoTradedSince++;

  }
}

module.exports = method;
