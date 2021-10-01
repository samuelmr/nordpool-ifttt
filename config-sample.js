const config = {
  area: 'FI', // see http://www.nordpoolspot.com/maps/
  currency: 'EUR', // can also be 'DKK', 'NOK', 'SEK'
  currencySubUnit: 'snt', // 1/100 of currency, used to format the message passed to IFTTT, can be 'cents', 'öre', 'øre', ...
  highTreshold: 8, // send event when price > highTreshold
  lowTreshold: 5, // send event when price < lowTreshold
  maxHighHours: 24, // max consecutive high hours
  maxLowHours: 24, // max consecutive low hours
  vatPercent: 24, // if you want prices including value-added tax (VAT), enter the percentage here
  iftttKey: 'CHANGE', // see https://ifttt.com/services/maker_webhooks/settings
  debugLevel: 1
};

export {config};
