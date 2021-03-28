import { Injectable } from '@angular/core';
import { Asset } from './models/asset';
import { Assets } from './models/assets';
import { Balance } from './models/balance';
import { BalanceItem } from './models/balance-item';
import { TradeHistory } from './models/trade-history';
import { TradeHistoryItem } from './models/trade-history-item';
declare var require: any;
const {bitvavo, websocketSetListeners} = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getBalance(): Promise<Balance | undefined>{
    try {
      const list: BalanceItem[] = [];
      const response = await bitvavo.balance({});
      for (let entry of response) {
        list.push(new BalanceItem(entry));
      }
      return new Balance(list);
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

  public async getTradeHistory(): Promise<TradeHistory | undefined> {
    try {
      const list: TradeHistoryItem[] = [];
      const response = await bitvavo.trades('ONG-EUR', {});
      console.log(response);
      for (let entry of response) {
        list.push(new TradeHistoryItem(entry));
      }
      return new TradeHistory(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }

  public async getAssets(): Promise<Assets | undefined> {
    try {
      const list: Asset[] = [];
      const response = await bitvavo.assets({});
      console.log(response);
      for (let entry of response) {
        list.push(new Asset(entry));
      }
      return new Assets(list);
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }
}
