<!-- ABOUT THE PROJECT -->
## About The Project

Everybody had this idea of trying to buy some stock or CC in a red market day. We check one and other, plot some lines, and write down the prices we would like to buy them. Sometimes we choose 10 or more, and most of the time, we just have enough free money to get 2 or 3. In this days we have to place some orders and in most of the cases we see other stocks touching that point we had written down, but the money is still allocated to those other orders. And in the end of the day, we don't buy the chosen ones because they did not sink as much as we expected neither the others that we missed the oportunity to buy.  

This is a useful script based on [node-binance-api](https://www.npmjs.com/package/node-binance-api) to allow you to watch multiple crypto currencies with a price target and place automatically a buy order when the symbol quote gets closer (0,7% above) of that target price.  
On the other hand, if the order is already placed and the price rises again, the order is automatically canceled to free your money for another shot.  

Using this script you can actually buy just a few crypto currencies from a list that you intend to buy as they will be sinking towards your target price while your account has free funds to allow the orders to be accepted.  

Tips:
* Fill `cath.json` with a row for each symbol with the complete symbol `BTCUSDT` (for instance)  
* The second field `value` is your target price. The price the CC shall drop for your order to be placed  
* Last field `totalUSD` is the amount of money in `USD` that you want to buy of that CC.  
* If `totalUSD` is less than 10, this line will be skipped. This can be helpful to archive a CC to use later, by changing this field to 0.  


## How To INSTALL and RUN
```
$ npm install
```

- fill your API KEY and SECRET in .env file. (rename .env-sample  
- change `catch.json` to fit your needs

```
$ node catcher.js
```

And you're ready to go!


## WARNING
We are using this script with Binance with good results but it was not extensivily tested.  
Please use it with responsability and special attention.  
We are not responsible for any finantial loss that may be caused directly or indirectly by this script.  
We disencourage the use of this program if you do not understand all the code in the file `catcher.js`.  
The use of this script will not guarantee any profits and finantial losses may occur.


## Contribution
Give this project a star ⭐  
Fork and Clone!  
If this is useful to you, donations and tips are welcome :blush:  
- BTC: 1AswM4QMpGSZMH9f4GtLbdCTxcPrVDGorL  
- ETH: 0xbcc7934ab7b285887be2ee36ab6bf1373619c94c  
- USDT: 0xbcc7934ab7b285887be2ee36ab6bf1373619c94c  


## License
This code is licensed under the MIT license.

