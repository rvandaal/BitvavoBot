import { Injectable } from '@angular/core';
import { Asset } from './models/asset';
import { TickerPriceResponse } from './response-models/ticker-price-reponse';
import { AssetResponse } from './response-models/asset-response';
import { BalanceResponse } from './response-models/balance-response';
import { TradeResponse } from './response-models/trade-response';
import { TickerPrice24hResponse } from './response-models/ticker-price-24h-response';
declare var require: any;
const { bitvavo } = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

// Reponsible for converting raw data into response models.

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getAssets(): Promise<AssetResponse[]> {
    try {
      if (this.ensurePositiveLimit()) {
        const list: AssetResponse[] = [];
        const response = await bitvavo.assets({});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          if (!['EUR', 'AE', 'DASH'].includes(item.symbol)) {
            list.push(new AssetResponse(item));
          }
        }
        return list;
      }
      return [];
    } catch (error) {
      return Promise.reject();
    }
  }

  public async getBalance(): Promise<BalanceResponse[]>{
    try {
      if (this.ensurePositiveLimit()) {
        const list: BalanceResponse[] = [];
        const response = await bitvavo.balance({});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          if (!['EUR', 'AE', 'DASH'].includes(item.symbol)) {
            list.push(new BalanceResponse(item));
          }
        }
        return list;
      }
      return [];
    } catch (error) {
      return Promise.reject();
    }

    // bitvavo.placeOrder('ETH-EUR', 'buy', 'limit', { amount: '3', price: '2' }, (error, response) => {
    //   if (error === null) {
    //     console.log(response)
    //   } else {
    //     console.log(error)
    //   }
    // })
  }

  public async getTrades(asset: Asset): Promise<TradeResponse[]> {
    try {
      if (this.ensurePositiveLimit()) {
        const list: TradeResponse[] = [];
        const response = await bitvavo.trades(asset.euroTradingPair, {});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          list.push(new TradeResponse(item));
        }
        return list;
      }
      return [];
    } catch (error) {
      return Promise.reject();
    }
  }

  public async getTickerPrices(): Promise<TickerPriceResponse[]> {
    try {
      if (this.ensurePositiveLimit()) {
        const list: TickerPriceResponse[] = [];
        const response = await bitvavo.tickerPrice({});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          const index = item.market.indexOf('-');
          const symbol = item.market.substr(0, index);
          if (!['EUR', 'AE', 'DASH'].includes(symbol)) {
            list.push(new TickerPriceResponse(item));
          }
        }
        return list;
      }
      return [];
    } catch (error) {
      return Promise.reject();
    }
  }

  public async getTickerPrices24h(): Promise<TickerPrice24hResponse[]> {
    try {
      if (this.ensurePositiveLimit()) {
        const list: TickerPrice24hResponse[] = [];
        const response = await bitvavo.ticker24h({});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          const index = item.market.indexOf('-');
          const symbol = item.market.substr(0, index);
          if (!['EUR', 'AE', 'DASH'].includes(symbol)) {
            list.push(new TickerPrice24hResponse(item));
          }
        }
        return list;
      }
      return [];
    } catch (error) {
      return Promise.reject();
    }
  }

  private ensurePositiveLimit(): boolean {
    const result = bitvavo.getRemainingLimit();
    console.log('Remaining limit: ', result);
    if (!result) {
      console.log('RATE LIMIT BEREIKT');
    }
    return result > 100;
  }
}
