#! /usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();

const Binance = require('node-binance-api');
const fs = require('fs');
const { timeStamp } = require('console');

let timeFrame = '15m';
let startup = 1;
let lockedPairs = [];

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET
});


let pairs;


// OPEN LIST
const cacthFile = 'catch.json';

syncPairs();


console.log('Running...');

function syncPairs() {
    try {
        if (fs.existsSync(cacthFile)) {
            let symbolData = fs.readFileSync(cacthFile);
            pairs = JSON.parse(symbolData);
            watchPairs();
        }
    } catch (err) {
        console.error(err);
    }
}


async function watchPairs() {
    for (let i = 0; i <= pairs.length - 1; i++) {
        if (pairs[i].totalUSD > 10) {

            try {
                console.log(pairs[i]);
                let candlesticks = await binance.candlesticks(pairs[i].symbol, timeFrame, (error, ticks, symbol) => { }, { limit: 1 });
                const last = candlesticks[candlesticks.length - 1];
                let percentToGo = Math.round((1 - pairs[i].value / last.high) * 100 * 10) / 10;
                let triggerQuote = Math.round(pairs[i].value * 1.007 * 1000000) / 1000000;

                if (percentToGo <= 5 && percentToGo > 2) {
                    console.log('\x1b[0m', pairs[i].symbol, last.high, pairs[i].value, triggerQuote, percentToGo + '%');
                } else if (percentToGo <= 2) {
                    console.log('\x1b[1m', pairs[i].symbol, last.high, pairs[i].value, triggerQuote, percentToGo + '%', '\x1b[0m');
                } else if (percentToGo > 5) {
                    console.log('\x1b[2m', pairs[i].symbol, last.high, pairs[i].value, triggerQuote, percentToGo + '%', '\x1b[0m');
                }

                if (pairs[i].value * 1.007 >= last.high) {
                    let buyQTY = Math.floor((pairs[i].totalUSD / pairs[i].value) * 10) / 10;
                    try {
                        const activeOrders = await binance.openOrders(pairs[i].symbol, { "timestamp": Date.now() * 1000 });

                        if (activeOrders.length == 0 && !lockedPairs.includes(pairs[i].symbol)) {
                            console.log('Adding buy order for ' + buyQTY + ' of ' + pairs[i].symbol);
                            try {
                                const buyOrder = await binance.buy(pairs[i].symbol, buyQTY, pairs[i].value);
                                console.log(buyOrder);

                                // LOCK THIS PAIR TO AVOID NEW ORDER (this lockage is still valid while the script is running as it is stored in an array)
                                lockedPairs.push(pairs[i].symbol);
                            } catch (err) {
                                console.log('buyOrder: ', err);
                            }

                        }
                    } catch (err) {
                        console.log('activeOrders: ', err);
                    }

                } else {
                    try {
                        const activeOrders = await binance.openOrders(pairs[i].symbol, { "timestamp": Date.now() * 1000 });

                        if (activeOrders.length > 0) {
                            console.log('removing old order for ' + pairs[i].symbol);
                            try {
                                const cancelation = await binance.cancelAll(pairs[i].symbol, { "timestamp": Date.now() * 1000 });

                                // AS THE ORDER IS CANCELED LET's FREE THIS SYMBOL FOR NEW ORDERS
                                removeLockedPair(pairs[i].symbol);
                            } catch (err) {
                                console.log('cancelation: ', err);
                            }
                        }
                    } catch (err) {
                        console.log('activeOrders: ', err);
                    }
                }

            } catch (err) {
                console.log('candlesticks: ', err);
            }
        }
    }

    // CHECK FOR NEW QUOTES EVERY 30 SECONDS
    setTimeout(function () {
        console.log(' ');
        syncPairs();
    }, 30000);
}



function removeLockedPair(value) {

    const found = lockedPairs.indexOf(value);
    lockedPairs.splice(found, 1);
}

