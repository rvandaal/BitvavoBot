import { Observable } from 'rxjs';
import { IBotService } from 'src/interfaces/i-bot-service';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { Bot } from 'src/trading/bot';
import { CoinService } from './coin-service';

export class BacktestOpenOrder {
  constructor(public orderId: string, public amount: number | undefined, public price: number, public isBuy: boolean) {}
}

export class BacktestService implements IBotService {

  protected orderId = 0;

  protected candleResponses: CandleResponse[] = [];

  protected currentCandle: CandleResponse | undefined;

  protected bot: Bot | undefined;

  public get currentPrice(): number {
    if (this.currentCandle) {
      return this.currentCandle.open;
    }
    return 0;
  }

  public get fee(): Fee | undefined {
    return this.coinService.fee;
  }

  constructor(protected coinService: CoinService) {

  }

  public registerForCandles(asset: Asset, intervalInSeconds: number, candleInterval: string): Observable<CandleResponse[]> {
      // todo
    return this.coinService.registerForCandles(asset, intervalInSeconds, candleInterval);
  }

  public async initialize(bot: Bot, candleInterval: string): Promise<void> {
    this.bot = bot;
    console.log('==============================');
    console.log('START BACKTEST');
    this.candleResponses = await this.coinService.getCandles(bot.asset, candleInterval);
    this.currentCandle = this.candleResponses[this.candleResponses.length - 1];
  }

  public async start(): Promise<void> {
    return Promise.reject();
  }

  public updateBalance(): Promise<void> {
    return Promise.resolve();
  }

  public cancelOrder(_1: Asset, _2: string): Promise<void> {
    return Promise.resolve();
  }

  public placeBuyOrder(
      asset: Asset,
      tradeAmount: number,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    return this.placeOrder(asset, tradeAmount, tradePrice, true);

  }

  public placeSellOrder(
      asset: Asset,
      tradeAmount: number | undefined,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    return this.placeOrder(asset, tradeAmount, tradePrice, false);
  }

  public placeOrder(
    asset: Asset,
    tradeAmount: number | undefined,
    tradePrice: number | undefined,
    isBuy: boolean
  ): Promise<PlaceOrderResponse | undefined> {
    return Promise.reject();
  }

  public notifyCandlesProcessed(): void {

  }

  protected getMarketOrderResponse(tradeAmount: number | undefined): any {
    if (!this.currentCandle || !tradeAmount) {
        return undefined;
    }
    return {
        orderId: this.orderId.toString(),
        orderType: 'market',
        fills: [
          {
            amount: tradeAmount,
            price: this.currentCandle.close,
            fee: 0 // todo
          }
        ]
      };
  }


}
