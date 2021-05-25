import { IBotService } from 'src/interfaces/i-bot-service';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { Trade } from 'src/models/trade';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { TradeResponse } from 'src/response-models/trade-response';
import { Bot } from 'src/trading/bot';
import { CoinService } from './coin-service';

class BacktestOpenOrder {
  constructor(public orderId: string, public amount: number | undefined, public price: number, public isBuy: boolean) {}
}

export class BacktestService implements IBotService {

  public bot: Bot | undefined;

  private openOrders: BacktestOpenOrder[] = [];

  private orderId = 0;

  private candleResponses: CandleResponse[] = [];

  private fee: Fee | undefined;

  private currentCandle: CandleResponse | undefined;

  public get currentPrice(): number {
    if (this.currentCandle) {
      return this.currentCandle.open;
    }
    return 0;
  }

  constructor(private coinService: CoinService) {
    this.fee = this.coinService.fee;
    // (async () => {
    //   this.candleResponses = await this.coinService.getCandles()
    // })();

    // 1. Bot doet market order en plaatst initiele orders.
    // 2. BacktestService start en haalt candles op van de laatste 24h
    // 3. Loop door candles
    // 4. Kijk per candle welke orders geraakt worden, i.e. welke orders in de low-high zitten
    // 5. Per gevulde order: Roep processFilledOrder aan op de bot, deze plaatst een nieuwe order

    // Ofwel, backtestService moet ref naar bot hebben

  }

  public async start(): Promise<void> {
    console.log('==============================');
    console.log('START BACKTEST');
    if (this.bot) {
      this.candleResponses = await this.coinService.getCandles(this.bot.asset, '1m');
      this.currentCandle = this.candleResponses[this.candleResponses.length - 1];
    }
  }

  public async startLoop(): Promise<void> {
    console.log('=================================================================');
    console.log('START loop, number of candles: ', this.candleResponses.length);
    if (this.bot && this.fee) {
      for (let i = this.candleResponses.length - 1; i >= 0; i--) {
        const candleResponse = this.candleResponses[i];
        this.currentCandle = candleResponse;

        // console.log('---------------------------------');
        // console.log(
        //   i,
        //   ': new candle: ',
        //   ', low - high: ',
        //   candleResponse.low, ',', candleResponse.high
        // );
        //console.log('Open orders: ', this.openOrders);
        // Which orders are hit?
        const openOrdersHit =
          this.openOrders.filter(
            openOrder => candleResponse.low <= openOrder.price && openOrder.price <= candleResponse.high
          );
        const bot = this.bot;
        const fee = this.fee;
        const listToDelete: BacktestOpenOrder[] = [];
        await Promise.all(openOrdersHit.map(async openOrder => {
          if (openOrder && openOrder.amount) {
            const response = {
              amount: openOrder.amount,
              price: openOrder.price,
              fee: fee.maker * openOrder.amount * openOrder.price, // todo: check
              side: openOrder.isBuy ? 'buy' : 'sell'
            };
            const tradeResponse = new TradeResponse(response);
            const trade = new Trade(tradeResponse);
            console.log(openOrder);
            console.log(trade);
            const processed = await bot.processFilledOrder(openOrder.orderId, [trade]);
            if (processed) {
              listToDelete.push(openOrder);
            }
          }
        }));
        listToDelete.forEach(openOrder => {
          const index = this.openOrders.indexOf(openOrder);
          if (index > -1) {
            console.log('Remove order with price: ', openOrder.price);
            this.openOrders.splice(index, 1);
          }
        });
      }
      console.log('Einde loop');
    }
  }

  public updateBalance(): Promise<void> {
    return this.coinService.updateBalance();
  }

  public cancelOrder(asset: Asset, orderId: string): Promise<void> {
    return this.coinService.cancelOrder(asset, orderId);
  }

  public async placeBuyOrder(
      asset: Asset,
      tradeAmount: number,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    //return this.coinService.placeBuyOrder(asset, tradeAmount, tradePrice, tradeTriggerPrice);
    return this.placeOrder(asset, tradeAmount, tradePrice, true);

  }

  public async placeSellOrder(
      asset: Asset,
      tradeAmount: number | undefined,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    // return this.coinService.placeSellOrder(asset, tradeAmount, tradePrice, tradeTriggerPrice);
    return this.placeOrder(asset, tradeAmount, tradePrice, false);
  }

  public async placeOrder(
    asset: Asset,
    tradeAmount: number | undefined,
    tradePrice: number | undefined,
    isBuy: boolean
  ): Promise<PlaceOrderResponse | undefined> {
    let response;

    if (!tradePrice && this.currentCandle) {
      // Market order, fill immediately

      response = {
        orderId: this.orderId.toString(),
        fills: [
          {
            amount: tradeAmount,
            price: this.currentCandle.open,
            fee: 0 // todo
          }
        ]
      };
      this.orderId++;
    } else if (tradePrice){
      // Limit order
      const openOrder = new BacktestOpenOrder(this.orderId.toString(), tradeAmount, tradePrice, isBuy);
      this.openOrders.push(openOrder);
      //console.log(JSON.stringify(this.openOrders));
      response = {
        orderId: this.orderId.toString(),
        fills: []
      };
      this.orderId++;
    }
    return new Promise(resolve => {
      resolve(new PlaceOrderResponse(response));
    });
  }


}
