import { Injectable } from '@angular/core';
import { Asset } from './models/asset';
import { TickerPriceResponse } from './response-models/ticker-price-reponse';
import { AssetResponse } from './response-models/asset-response';
import { BalanceResponse } from './response-models/balance-response';
import { TradeResponse } from './response-models/trade-response';
import { TickerPrice24hResponse } from './response-models/ticker-price-24h-response';
import { PlaceOrderResponse } from './response-models/place-order-response';
import { OpenOrderResponse } from './response-models/open-order-response';
import { FeeResponse } from './response-models/fee-reponse';
declare var require: any;
const { bitvavo } = require('./bitvavo-api');

// chrome via taskbar starten, deze zet de CORS check uit

// Reponsible for converting raw data into response models.

@Injectable({
  providedIn: 'root'
})
export class BitvavoService {

  constructor() { }

  public async getFees(): Promise<FeeResponse> {
    const response = await bitvavo.account();
    return new FeeResponse(response);
  }

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

  public async placeBuyOrder (
    market: string,
    tradeAmount: number,
    tradePrice: number | undefined,
    tradeTriggerPrice: number | undefined
  ): Promise<PlaceOrderResponse> {
    return this.placeOrder(market, true, tradeAmount, tradePrice, tradeTriggerPrice);
  }

  public async placeSellOrder(
    market: string,
    tradeAmount: number,
    tradePrice: number | undefined,
    tradeTriggerPrice: number | undefined
  ): Promise<PlaceOrderResponse> {
    return this.placeOrder(market, false, tradeAmount, tradePrice, tradeTriggerPrice);
  }

  public async placeOrder(
    market: string,
    isBuy: boolean,
    tradeAmount: number,
    tradePrice: number | undefined,
    tradeTriggerPrice: number | undefined
  ): Promise<PlaceOrderResponse> {
    const side = isBuy ? 'buy' : 'sell';
    let response;
    if (tradePrice && tradeTriggerPrice) {
      // todo
    } else if (tradePrice) {

      // round to 0 decimals // change for other COINS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      tradePrice = Math.round(tradePrice);


      response = await bitvavo.placeOrder(market, side, 'limit', { amount: tradeAmount, price: tradePrice });
    } else {
      response = await bitvavo.placeOrder(market, side, 'market', { amount: tradeAmount});
    }
    console.log('amountRemaining: ', response.amountRemaining);
    return new PlaceOrderResponse(response);
  }

  public async cancelOrder(market: string, orderId: string): Promise<void> {
    await bitvavo.cancelOrder(market, orderId);
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

  public async getOpenOrders(): Promise<OpenOrderResponse[]> {
    try {
      if (this.ensurePositiveLimit()) {
        const list: OpenOrderResponse[] = [];
        const response = await bitvavo.ordersOpen({});
        // tslint:disable-next-line: prefer-const
        for (let item of response) {
          const index = item.market.indexOf('-');
          const symbol = item.market.substr(0, index);
          if (!['EUR', 'AE', 'DASH'].includes(symbol)) {
            list.push(new OpenOrderResponse(item));
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
    return result > 100;
  }
}
