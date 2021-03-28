import { Injectable } from '@angular/core';
import { Balance } from './models/balance';
import { BalanceItem } from './models/balance-item';
declare var require: any;
const {bitvavo, websocketSetListeners} = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getBalance(): Promise<Balance | undefined>{
    // try {
    //   const response = await bitvavo.time();
    //   console.log(response);
    // } catch (error) {
    //   console.log(error);
    // }

    try {
      const balanceList: BalanceItem[] = [];
      const response = await bitvavo.balance({});
      for (let entry of response) {
        balanceList.push(new BalanceItem(entry));
      }
      return new Balance(balanceList);
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
}
