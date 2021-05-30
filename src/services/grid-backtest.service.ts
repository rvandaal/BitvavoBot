import { IBotService } from 'src/interfaces/i-bot-service';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { Trade } from 'src/models/trade';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { TradeResponse } from 'src/response-models/trade-response';
import { Bot } from 'src/trading/bot';
import { BacktestService } from './backtest.service';
import { CoinService } from './coin-service';

class BacktestOpenOrder {
  constructor(public orderId: string, public amount: number | undefined, public price: number, public isBuy: boolean) {}
}

export class GridBacktestService extends BacktestService {

  private openOrders: BacktestOpenOrder[] = [];

  public get currentPrice(): number {
    if (this.currentCandle) {
      return this.currentCandle.open;
    }
    return 0;
  }

  constructor(coinService: CoinService) {
    super(coinService);
  }

  public async start(): Promise<void> {
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

  public async placeOrder(
    asset: Asset,
    tradeAmount: number | undefined,
    tradePrice: number | undefined,
    isBuy: boolean
  ): Promise<PlaceOrderResponse | undefined> {
    let response;

    if (!tradePrice && this.currentCandle) {
      // Market order, fill immediately
      response = this.getMarketOrderResponse(tradeAmount);
      this.orderId++;
    } else if (tradePrice){
      // Limit order
      const openOrder = new BacktestOpenOrder(this.orderId.toString(), tradeAmount, tradePrice, isBuy);
      this.openOrders.push(openOrder);
      response = {
        orderId: this.orderId.toString(),
        fills: []
      };
      this.orderId++;
    }
    if (!response) {
      return Promise.reject();
    }
    return Promise.resolve(new PlaceOrderResponse(response));
  }


}
