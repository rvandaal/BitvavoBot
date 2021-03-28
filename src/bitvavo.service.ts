import { Injectable } from '@angular/core';
declare var require: any;
const {bitvavo, websocketSetListeners} = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getTime(): Promise<void>{
    // try {
    //   const response = await bitvavo.time();
    //   console.log(response);
    // } catch (error) {
    //   console.log(error);
    // }

    try {
      const response = await bitvavo.balance({});
      for (let entry of response) {
        console.log(entry);
      }
    } catch (error) {
      console.log(error);
    }

    // bitvavo.placeOrder('ETH-EUR', 'buy', 'limit', { amount: '3', price: '2' }, (error, response) => {
    //   if (error === null) {
    //     console.log(response)
    //   } else {
    //     console.log(error)
    //   }
    // })
  }
}
