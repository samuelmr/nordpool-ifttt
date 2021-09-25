const config = {
  area: 'FI', // see http://www.nordpoolspot.com/maps/
  currency: 'EUR', // can also be 'DKK', 'NOK', 'SEK'
  highTreshold: 60, // send event when price > highTreshold EUR/MWh
  lowTreshold: 30, // send event when price < lowTreshold EUR/MWh
  maxHighHours: 24, // max consecutive high hours
  maxLowHours: 24, // max consecutive low hours
  vatPercent: 24, // if you want prices including value-added tax (VAT), enter the percentage here
  iftttKey: 'CHANGE' // see https://ifttt.com/services/maker_webhooks/settings
};

export {config};
