
# Trigger Nordpool/Elspot price change events to your IFTTT Maker Channel
Gets day-ahead prices from [Nordpool](http://www.nordpoolspot.com/Market-data1/Elspot/)

## Installation
    npm install nordpool-ifttt
    cd nordpool-ifttt
    cp config-sample.js config.js
    $EDITOR config.js

Set your IFTTT maker key from https://ifttt.com/services/maker_webhooks/settings

## Usage

You can simply run the index script and leave it running. It will keep pushing events to IFTTT until it gets killed.

    node index.js

Better option is to use a process manager like [PM2](http://pm2.keymetrics.io/) to keep the script running.

    pm2 start ./index.js --name "Nordpool IFTTT trigger"
    pm2 save

Enjoy!
