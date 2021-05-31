import { Observable, Subject } from 'rxjs';
import { RsiIndicator } from 'src/indicators/rsi-indicator';
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

export class RsiBacktestService extends BacktestService {

  private currentIndex = 0;

  private candleSubject = new Subject<CandleResponse[]>();

  public get currentPrice(): number {
    if (this.currentCandle) {
      return this.currentCandle.open;
    }
    return 0;
  }

  constructor(coinService: CoinService, private rsiPeriod: number) {
    super(coinService);
  }

  public async initialize(bot: Bot, candleInterval: string): Promise<void> {
      await super.initialize(bot, candleInterval);
  }

  public registerForCandles(_1: Asset, _2: number, _3: string): Observable<CandleResponse[]> {
    return this.candleSubject.asObservable();
  }

  public async start(): Promise<void> {
    console.log('=================================================================');
    console.log('START loop, number of candles: ', this.candleResponses.length);

    if (this.bot && this.fee) {
      let startIndex;
      let endIndex;
      for (let i = this.candleResponses.length - 1301; i >= 0; i--) {                       // todo: deze loop wordt synchroon uitgevoerd, hij zou op de subscribe moeten wachten
        console.log('------------------------------------------------------');
        console.log('Candle: ', (this.candleResponses.length - 1 - i));
        startIndex = i;
        endIndex = Math.min(this.candleResponses.length, i + this.rsiPeriod + 1);
        this.currentCandle = this.candleResponses[i];
        // roep subject aan met de laatste rsiPeriod + 1 candles, hieruit kunnen 2 rsi punten worden berekend
        const result = this.candleResponses.slice(startIndex, endIndex);
        this.candleSubject.next(result);

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

    if (this.currentCandle) {
      // Market order, fill immediately
      response = this.getMarketOrderResponse(tradeAmount);
      this.orderId++;
    }
    if (!response) {
      return Promise.reject();
    }
    return Promise.resolve(new PlaceOrderResponse(response));
  }

  public notifyCandlesProcessed(): void {

  }

}
