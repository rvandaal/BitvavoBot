import { Injectable } from '@angular/core';
import { loga } from 'src/logr';
import { Asset } from 'src/models/asset';
import { Bot } from 'src/trading/bot';
import { GridBot } from 'src/trading/grid-bot';
import { IGridConfig } from 'src/trading/i-grid-config';
import { CoinService } from './coin-service';

export type BotType = 'grid';

export type BotOrderDictionary = Record<string, Bot>;

@Injectable({
  providedIn: 'root'
})
export class BotService {

  public assets: Asset[];
  private botOrdersInternal: BotOrderDictionary = {};

  constructor(private coinService: CoinService) {
    // Assumption: coin service has been started
    this.assets = Object.keys(this.coinService.assets).map(k => this.coinService.assets[k]);

    this.coinService.openOrderFilled$.subscribe({next: orderId => {
      const bot = this.botOrdersInternal[orderId];
      if (bot) {
        const tradesWhichFilledTheOrder = bot.asset.trades.filter(t => t.orderId === orderId);
        bot.processFilledOrder(orderId, tradesWhichFilledTheOrder);
        delete this.botOrdersInternal[orderId];
      }
    }});
  }

  public startGridBot(config: IGridConfig): GridBot {
    if (config.numberOfGridLines % 2 === 0) {
      alert('number of grid lines must be odd');
    }
    const gridBot = new GridBot(config, this, this.coinService);
    gridBot.start();
    return gridBot;
  }

  @loga()
  public registerBotForOpenOrder(orderId: string, bot: Bot): void { // called by bot
      this.botOrdersInternal[orderId] = bot;
  }
}
