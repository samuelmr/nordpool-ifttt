const schedule = require('node-schedule');
const nordpool = require('nordpool');
const prices = new nordpool.Prices();
const config = require('./config');
const findStreak = require('findstreak');

const lowEvent = 'nordpool-price-low';
const normEvent = 'nordpool-price-normal';
const highEvent = 'nordpool-price-high';

// get latest prices immediately
getPrices();

// Prices for tomorrow are published today at 12:42 CET or later
// (http://www.nordpoolspot.com/How-does-it-work/Day-ahead-market-Elspot-/)
// update prices at 15:15 UTC
const d = new Date();
const myTZoffset = Math.ceil(d.getTimezoneOffset()/60);
let priceUpdateHour = 15 - myTZoffset;
let cronPattern = '15 ' + priceUpdateHour + ' * * *';
// cronPattern = [d.getMinutes()+1, d.getHours(), '*', '*', '*'].join(' ')
// console.log(cronPattern);
// schedule a job to get newest prices once a day
let getPricesJob = schedule.scheduleJob(cronPattern, getPrices);
let hiJobs = [];
let loJobs = [];
let normJobs = [];

function getPrices() {
  prices.hourly(config, (error, results) => {
    if (error) {
      console.error(error);
      return;
    }
    // console.log(results);
    let hiHours = [];
    let loHours = [];
    let normHours = [];
    let tmpHours = [];
    var currentArray = normHours;
    var lastArray = currentArray;
    for (var i=0; i<results.length; i++) {
      let date = results[i].date;
      let price = results[i].value; // float, EUR/MWh
      if (price > config.highTreshold) {
        currentArray = hiHours;
      }
      else if (price < config.lowTreshold) {
        currentArray = loHours;
      }
      else {
        currentArray = normHours;
      }
      if (currentArray !== lastArray) {
        var max = 24;
        var lo = false;
        if (lastArray === hiHours) {
          max = config.maxHighHours;
        }
        else if (lastArray === loHours) {
          max = config.maxLowHours;
          var lo = true;
        }
        let rf = (a, b) => a + b.value;
        if (tmpHours.length > 0) {
          let streak = findStreak(tmpHours, max, rf, lo);
          lastArray.push(streak[0]);
          if ((lastArray !== normHours) && (streak.length < tmpHours.length)) {
            let firstIndex = streak[0].date.get('hours') - tmpHours[0].date.get('hours');
            if (firstIndex > 0) {
              normHours.push(tmpHours[0]);
            }
            if (firstIndex < (tmpHours.length - streak.length)) {
              normHours.push(tmpHours[firstIndex + streak.length]);
            }
          }
        }
        lastArray = currentArray;
        tmpHours = [];
      }
      else if (i == results.length - 1) {
        lastArray.push(tmpHours[0]);
      }
      tmpHours.push(results[i]);
    }
    loHours.forEach(item => {
      loJobs.push(schedule.scheduleJob(item.date, trigger.bind(null, lowEvent, item)));
    });
    normHours.forEach(item => {
      normJobs.push(schedule.scheduleJob(item.date, trigger.bind(null, normEvent, item)));
    });
    hiHours.forEach(item => {
      hiJobs.push(schedule.scheduleJob(item.date, trigger.bind(null, highEvent, item)));
    });
  });
}

function trigger(tr, item) {
  let values = {
    value1: item.value,
    value2: config.currency + '/MWh',
    value3: results.date.format('H:mm')
  };
  var opts = {
    url: 'https://maker.ifttt.com/trigger/' + tr + '/with/key/' + config.iftttKey,
    json: true,
    body: values
  };
  console.log('POSTing ' + tr + ' warning for price ' + values.value1 + ' at ' + values.value2);
  request.post(opts, function(err, res) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Success: ' + res.body)
  })

}
