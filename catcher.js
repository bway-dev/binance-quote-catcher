#! /usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();

const Binance = require('node-binance-api')
const fs = require('fs')

let timeFrame = '15m';
let startup = 1;
let lockedPairs = [];

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
});


const delay = async (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));


let pairs


// OPEN LIST
const cacthFile = 'catch.json'

syncPairs();

setInterval(function(){
    syncPairs()
}, 60000);

console.log('Running...');

function syncPairs() {
    try {
        if (fs.existsSync(cacthFile)) {
            let symbolData = fs.readFileSync(cacthFile)
            pairs = JSON.parse(symbolData)
            if (startup == 1) {
                watchPairs();
                startup = 0;
            }
        }
    } catch(err) {
        console.error(err)
    }
}


async function watchPairs() {
    for (let i = 0; i <= pairs.length - 1; i++) {  
        if (pairs[i].totalUSD > 10) {
            
            let candlesticks = await binance.candlesticks(pairs[i].symbol, timeFrame, false, {limit: 1});
            // [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored]
            let percentToGo = Math.round((1 - pairs[i].value/candlesticks[0][3]) * 100 * 10) / 10;
            let triggerQuote = Math.round(pairs[i].value * 1.007 * 1000000)/1000000;

            if (percentToGo <= 5 && percentToGo > 2) {
                console.log('\x1b[0m', pairs[i].symbol, candlesticks[0][3], pairs[i].value, triggerQuote, percentToGo + '%');
            }else if (percentToGo <= 2) {
                console.log('\x1b[1m', pairs[i].symbol, candlesticks[0][3], pairs[i].value, triggerQuote, percentToGo + '%', '\x1b[0m');
            }else if (percentToGo > 5) {
                console.log('\x1b[2m', pairs[i].symbol, candlesticks[0][3], pairs[i].value, triggerQuote, percentToGo + '%', '\x1b[0m');
            }
        
        
            if (pairs[i].value * 1.007 >= candlesticks[0][3]) {
                let buyQTY = Math.floor((pairs[i].totalUSD / pairs[i].value) * 10) / 10;
                const activeOrders = await binance.openOrders(pairs[i].symbol);

                if (activeOrders.length == 0 && !lockedPairs.includes(pairs[i].symbol)) {
                    console.log('Adding buy order for ' + buyQTY + ' of ' + pairs[i].symbol)
                    const buyOrder = await binance.buy(pairs[i].symbol, buyQTY, pairs[i].value);
                    console.log(buyOrder);
                    lockedPairs.push(pairs[i].symbol);
                }
            }else {
                const activeOrders = await binance.openOrders(pairs[i].symbol);
                if (activeOrders.length > 0) {
                    console.log('removing old order for ' + pairs[i].symbol)
                    const cancelation = await binance.cancelAll(pairs[i].symbol);
                    removeLockedPair(pairs[i].symbol);
                }
            }
        }
    }
}


setInterval(function(){
    console.log(' ')
    watchPairs()
}, 30000);



function removeLockedPair(value) {

    const found = lockedPairs.indexOf(value);
    lockedPairs.splice(found, 1);
}

