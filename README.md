
# Trigger Nordpool/Elspot price change events to your IFTTT Maker Channel
Gets day-ahead prices from [Nordpool](http://www.nordpoolspot.com/Market-data1/Elspot/)

## Installation
    npm install nordpool-ifttt
    cd nordpool-ifttt
    cp config-sample.js config.js
    $EDITOR config.js

## Configuration
Configuration parameters:
- `area`: Set the area where you want to follow the prices. You can see
  Nordpool/Elspot areas at http://www.nordpoolspot.com/maps/
  Currently the active areas are BERGEN, DK1, DK2, EE, ELE, FRE, KR.SAND,
  KT, LT, LV, MOLDE, OSLO, SE, SE1, SE2, SE3, SE4, SYS, TR.HEIM and TROMSØ
- `currency`: Choose either `DKK`, `EUR`, `NOK` or `SEK`
- `highTreshold`: Set the price limit above which you want the high price
  event to be triggered. (Price is for MWh in your selected `currency`. For
  example the value 60 means 6 snt/KWh if your `currency` is `EUR`.)
- `lowTreshold`: Set the price limit above which you want the high price
  event to be triggered.
- `maxHighHours`: If you use IFTTT to turn off heating when the energy price
  is high, you may want to limit the time your heating is off. If you set the
  `maxHighHours` to 3 and the energy price will be above your `highTreshold`
  for 7 hours, only the 3 most expensive consecutive hours will be triggered.
  Set to 24 if you want triggers for actual events.
- `maxLowHours`: Same as `maxHighHours` but for hours below `lowTreshold`.
  If you want to turn some appliances on when the price is lowest, but don't
  want or need to have them on for too long, setting `maxLowHours` to 2 will
  select the two cheapest hours from every cheap streak (consecutive hours
  when the price is below `lowTreshold`). Set to 24 if you don't need limits.
- `iftttKey`: Activate your IFTTT maker channel and get the key from
  https://ifttt.com/services/maker_webhooks/settings.

## Usage

Start script will run [PM2](http://pm2.keymetrics.io/) to keep the script running.
    npm start

Enjoy!
