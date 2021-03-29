import { Injectable } from '@angular/core';
import { Asset } from './models/asset';
import { Assets } from './models/assets';
import { Balances } from './models/balances';
import { Balance } from './models/balance';
import { TickerPrice } from './models/ticker-price';
import { TickerPrices } from './models/ticker-prices';
import { Trades } from './models/trades';
import { Trade } from './models/trade';
declare var require: any;
const {bitvavo, websocketSetListeners} = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getBalance(): Promise<Balances | undefined>{
    try {
      const list: Balance[] = [];
      const response = await bitvavo.balance({});
      for (let entry of response) {
        list.push(new Balance(entry));
      }
      return new Balances(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;

    // bitvavo.placeOrder('ETH-EUR', 'buy', 'limit', { amount: '3', price: '2' }, (error, response) => {
    //   if (error === null) {
    //     console.log(response)
    //   } else {
    //     console.log(error)
    //   }
    // })
  }

  public async getTrades(asset: Asset): Promise<Trades | undefined> {
    try {
      const list: Trade[] = [];
      const response = await bitvavo.trades(asset.euroTradingPair, {});
      for (let entry of response) {
        list.push(new Trade(entry));
      }
      return new Trades(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public async getAssets(): Promise<Assets | undefined> {
    try {
      const list: Asset[] = [];
      const response = await bitvavo.assets({});
      for (let entry of response) {
        list.push(new Asset(entry));
      }
      return new Assets(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public async getTickerPrices(): Promise<TickerPrices | undefined> {
    try {
      const list: TickerPrice[] = [];
      const response = await bitvavo.tickerPrice({});
      for (let entry of response) {
        list.push(new TickerPrice(entry));
      }
      return new TickerPrices(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }
}
