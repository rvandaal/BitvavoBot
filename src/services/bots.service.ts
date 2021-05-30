import { Injectable } from '@angular/core';
import { loga } from 'src/logr';
import { Asset } from 'src/models/asset';
import { Bot } from 'src/trading/bot';
import { GridBot } from 'src/trading/grid-bot';
import { IGridConfig } from 'src/trading/i-grid-config';
import { GridBacktestService } from './grid-backtest.service';
import { BotService } from './bot.service';
import { CoinService } from './coin-service';
import { RsiBot } from 'src/trading/rsi-bot';
import { IRsiConfig } from 'src/trading/i-rsi-config';
import { RsiBacktestService } from './rsi-backtest.service';

export type BotType = 'grid' | 'rsi';

export type BotOrderDictionary = Record<string, Bot>;

@Injectable({
  providedIn: 'root'
})
export class BotsService {

  public assets: Asset[] = [];
  // private botOrdersInternal: BotOrderDictionary = {};
  private bots: Bot[] = [];

  constructor(private coinService: CoinService, private botService: BotService) {
    // Assumption: coin service has been started
    this.coinService.start().then(() => {
      this.assets = Object.keys(this.coinService.assets).map(k => this.coinService.assets[k]);
    });

    this.coinService.openOrderFilled$.subscribe({next: orderId => {
      this.bots.forEach(bot => {
        const tradesWhichFilledTheOrder = bot.asset.trades.filter(t => t.orderId === orderId);
        bot.processFilledOrder(orderId, tradesWhichFilledTheOrder);
      });
      // const bot = this.botOrdersInternal[orderId];
      // if (bot) {
      //   const tradesWhichFilledTheOrder = bot.asset.trades.filter(t => t.orderId === orderId);
      //   bot.processFilledOrder(orderId, tradesWhichFilledTheOrder);
      //   delete this.botOrdersInternal[orderId];
      // }
    }});
  }

  public startGridBot(config: IGridConfig): GridBot {
    throw new Error('May not start bot');
    // if (config.numberOfGridLines % 2 === 0) {
    //   alert('number of grid lines must be odd');
    // }
    // const gridBot = new GridBot(config, this.botService);
    // this.botService.bot = gridBot;
    // gridBot.start();
    // this.bots.push(gridBot);
    // return gridBot;
  }

  public startRsiBot(config: IRsiConfig): RsiBot {
    throw new Error('May not start bot');
  }

  public async stopBot(bot: Bot): Promise<void> {
    //
    // discussie of bot zelf zijn open orders moet bijhouden ipv de coinservice:
    // coinservice moet dit toch doen, ook als er geen bots zijn
    // de bot kan dus beter de coinservice aanroepen om een buy of sell order te plaatsen
    //
    if (bot) {
      await bot.stop();

      // clean administration
      const index = this.bots.indexOf(bot);
      if (index > -1) {
        this.bots.splice(index, 1);
      }
    }
  }

  @loga()
  public async backtestGridBot(config: IGridConfig): Promise<GridBot> {
    if (config.numberOfGridLines % 2 === 0) {
      alert('number of grid lines must be odd');
    }
    const backtestService = new GridBacktestService(this.coinService);
    const gridBot = new GridBot(config, backtestService);
    await backtestService.initialize(gridBot, '1m');
    await gridBot.start();
    await backtestService.start();
    return gridBot;
  }

  @loga()
  public async backtestRsiBot(config: IRsiConfig): Promise<RsiBot> {
    const backtestService = new RsiBacktestService(this.coinService, config.rsiPeriod);
    const rsiBot = new RsiBot(config, backtestService);
    await backtestService.initialize(rsiBot, config.candleInterval);
    await rsiBot.start();
    await backtestService.start();
    return rsiBot;
  }
}
