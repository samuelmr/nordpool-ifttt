import schedule from 'node-schedule';
import {nordpool} from 'nordpool';
import moment from 'moment-timezone';
import {config} from './config.js';
import findStreak from 'findstreak';
import request from 'request';

const prices = new nordpool.Prices();
const lowEvent = 'nordpool_price_low';
const normEvent = 'nordpool_price_normal';
const highEvent = 'nordpool_price_high';

const iftttUrl = 'https://maker.ifttt.com/trigger/';

let myTZ = moment.tz.guess();
let jobs = [];

if (config.debugLevel > 1) console.log(`Config:\n${JSON.stringify(config, null, 1)}`);

// get latest prices immediately
getPrices('today');

// Prices for tomorrow are published today at 12:42 CET or later
// (http://www.nordpoolspot.com/How-does-it-work/Day-ahead-market-Elspot-/)
// update prices at 13:00 UTC
let cronPattern = moment.tz('13:00Z', 'HH:mm:Z', myTZ).format('m H * * *');
// cronPattern = '* */12 * * *';
// console.log(cronPattern);
let getPricesJob = schedule.scheduleJob(cronPattern, getPrices.bind(null, 'tomorrow'));



async function getPrices(dayName) {
  const date = moment(new Date());
  if (config.debugLevel > 0) console.log(`${date.format()}: Getting prices for ${dayName}`);
  if (dayName == 'tomorrow') {
    date.add(1, 'day');
  }
  try {
    const opts = {
      area: config.area,
      currency: config.currency,
      date: date
    };
    if (config.debugLevel > 3) console.log(`opts:\n${JSON.stringify(opts, null, 1)}`);
    const results = await prices.hourly(opts);
    if (config.debugLevel > 2) console.log(`results:\n${JSON.stringify(results, null, 1)}`);
    let events = [];
    let tmpHours = [];
    let previousEvent = normEvent;
    results.forEach((item, index) => {
      item.date = moment(item.date).tz(myTZ);
      if (config.vatPercent) {
          item.value = item.value * (100 + config.vatPercent) / 100;
      }
      item.value = Math.round(item.value * 100)/1000; // Eur/MWh to cents/kWh
      if (item.value > config.highTreshold) {
        if (config.debugLevel > 1) console.log(`${item.date}: ${item.value} > ${config.highTreshold}`);
        item.event = highEvent;
      }
      else if (item.value < config.lowTreshold) {
        if (config.debugLevel > 1) console.log(`${item.date}: ${item.value} < ${config.lowTreshold}`);
        item.event = lowEvent;
      }
      else {
        if (config.debugLevel > 1) console.log(`${item.date}: ${config.lowTreshold} < ${item.value} < ${config.highTreshold}`);
        item.event = normEvent;
      }
      // treshold crossed; let's see what we have stored...
      if (item.event != previousEvent) {
        var max = 24;
        var lo = false;
        if (previousEvent == highEvent) {
          max = config.maxHighHours;
        }
        else if (previousEvent == lowEvent) {
          max = config.maxLowHours;
          var lo = true;
        }
        let rf = (a, b) => a + b.value;
        // stored values exist
        if (tmpHours.length > 0) {
          // find correct number of hours
          let streak = findStreak(tmpHours, max, rf, lo);
          if (config.debugLevel > 3) console.log(`streak:\n${JSON.stringify(streak, null, 1)}`);
          // no events for the first normal streak
          if ((events.length > 0) || (previousEvent != normEvent)) {
            // create an event from the first hour in the streak
            events.push(streak[0]);
          }
          // if only some of the stored hours were included in the streak,
          // mark the rest of the hours as normal and trigger events
          if ((previousEvent != normEvent) && (streak.length < tmpHours.length)) {
            let firstIndex = streak[0].date.get('hours') - tmpHours[0].date.get('hours');
            let lastIndex = firstIndex + streak.length;
            // hours were clipped from the beginning of stored hours
            if (firstIndex > 0) {
              tmpHours[0].event = normEvent;
              events.push(tmpHours[0]);
            }
            // hours were clipped from the end of stored hours
            if (tmpHours.length > lastIndex) {
              tmpHours[lastIndex].event = normEvent;
              events.push(tmpHours[lastIndex]);
            }
          }
          // last hour in the Nordpool results
          else if (index == results.length - 1) {
            events.push(item);
          }
        }
        else {
          // events.push(item);
        }
        // start a new treshold interval
        previousEvent = item.event;
        tmpHours = [];
      }
      // last hour in the Nordpool results, create event at the first stored hour
      else if (index == results.length - 1) {
        events.push(tmpHours[0]);
      }
      // store all items in the current treshold interval
      tmpHours.push(item);
    });
    if (config.debugLevel > 2) console.log(`events:\n${JSON.stringify(events, null, 1)}`);
    events.forEach(item => {
      jobs.push(schedule.scheduleJob(item.date.toDate(), trigger.bind(null, item)));
      if (config.debugLevel > 0) console.log(item.date.format('D.M. H:mm'), item.value, item.event);
    });
  }
  catch (error) {
    throw new Error(error);
    return;
  }
}

function trigger(item) {
  let values = {
    value1: item.value.toFixed(3),
    value2: config.currencySubUnit + '/kWh',
    value3: item.date.format('H:mm')
  };
  var opts = {
    url: iftttUrl + item.event + '/with/key/' + config.iftttKey,
    json: true,
    body: values
  };
  console.log('Triggering ' + item.event + ' event: ' + JSON.stringify(values));
  request.post(opts, function(err, res) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Success: ' + res.body)
  })
}
