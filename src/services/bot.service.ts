import { Injectable } from '@angular/core';
import { IBotService } from 'src/interfaces/i-bot-service';
import { Asset } from 'src/models/asset';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { Bot } from 'src/trading/bot';
import { CoinService } from './coin-service';

@Injectable({
  providedIn: 'root'
})
export class BotService implements IBotService {

  public bot: Bot | undefined;

  public get currentPrice(): number {
    if (this.bot) {
      return this.bot.asset.currentPrice;
    }
    return 0;
  }

  // 1 service for all bots
  constructor(private coinService: CoinService) {

  }

  public updateBalance(): Promise<void> {
    return this.coinService.updateBalance();
  }

  public cancelOrder(asset: Asset, orderId: string): Promise<void> {
    return this.coinService.cancelOrder(asset, orderId);
  }

  public placeBuyOrder(
      asset: Asset,
      tradeAmount: number,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    return this.coinService.placeBuyOrder(asset, tradeAmount, tradePrice, undefined);
  }

  public placeSellOrder(
      asset: Asset,
      tradeAmount: number | undefined,
      tradePrice: number | undefined
  ): Promise<PlaceOrderResponse | undefined> {
    return this.coinService.placeSellOrder(asset, tradeAmount, tradePrice, undefined);
  }
}
