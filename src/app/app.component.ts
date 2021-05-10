import { ChangeDetectorRef, Component } from '@angular/core';
import { CoinService } from 'src/services/coin-service';
import { AssetVm } from 'src/view-models/asset-vm';
import { Trade } from 'src/models/trade';
import { MarketVm } from 'src/view-models/market-vm';
import { IGridConfig } from 'src/trading/i-grid-config';
import { GridCoinBot } from 'src/trading/grid-coin-bot';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public assets: AssetVm[] = [];
  public markets: MarketVm[] = [];

  public trades: Trade[] | undefined;
  public assetWithTradeDetailsOpen: AssetVm | undefined;
  public showAllCoins = true;
  public moreRowDetailsAtOnce = false;
  public moreRowDetailsAtOnceInOpenOrders = true;
  public assetWithRowDetailsOpen: AssetVm | undefined;
  public openOrderMarketWithRowDetailsOpen: MarketVm | undefined;
  public tradeAmountRaw: string | undefined;
  public tradePrice: string | undefined;
  public tradeTriggerPrice: string | undefined;

  title = 'BitvavoBot';

  public get tradeAmount(): number | undefined {
    const ta = this.tradeAmountRaw ? +this.tradeAmountRaw : undefined;
    return ta && !isNaN(ta) && ta > 0 ? ta : undefined;
  }

  constructor(private coinService: CoinService, cd: ChangeDetectorRef) {
    const sortFunc = (a: AssetVm, b: AssetVm) => {
      const br = b.relativeChange;
      const ar = a.relativeChange;
      //return !br && !ar ? b.change24h - a.change24h : br && !ar ? 1 : !br && ar ? -1 : br && ar ? br - ar : 0;
      //return b.numberOfSubsequentIncreasements - a.numberOfSubsequentIncreasements;
      return b.totalAmount - a.totalAmount;
    };
    this.coinService.notifications$.subscribe({
      next: () => {
        this.handleNotifications();
      }
    });
    // this.coinService.openOrders$.subscribe({
    //   next: (openOrders: OpenOrder[]) => {
    //     this.syncOpenOrders(openOrders);
    //   }
    // })
    this.coinService.start();
  }

  public onStartGridBotClick(): void {
    const ethAsset = this.coinService.assets['BTC'];
    const config: IGridConfig = {
        asset: ethAsset,
        numberOfGridLines: 30,
        halfRange: 300
    };
    const gridBot = new GridCoinBot(config, this.coinService);
    gridBot.start();
  }

  private handleNotifications(): void {
    const assets = this.coinService.assets;
    Object.keys(assets).forEach(key => {
      const asset = assets[key];
      const assetVm = this.assets.find(a => a.symbol === asset.symbol);
      if (!assetVm) {
        const newAssetVm = new AssetVm(asset);
        this.assets.push(newAssetVm);
      } else {
        assetVm.asset = asset;
      }
    });
    // todo: delete assetVm's if they are not in the model anymore.
  }

  public get openOrderMarkets(): MarketVm[] {
    return this.assets.map(asset => asset.marketVm).filter(m => m.openOrders.length > 0);
  }


  public onBuyOrSellButtonClick(asset: AssetVm, isBuy: boolean): void {
    let tradeAmount = this.tradeAmount ? +this.tradeAmount : undefined;
    tradeAmount = tradeAmount && !isNaN(tradeAmount) && tradeAmount > 0 ? tradeAmount : undefined;
    let tradePrice = this.tradePrice ? +this.tradePrice : undefined;
    tradePrice = tradePrice && !isNaN(tradePrice) && tradePrice > 0 ? tradePrice : undefined;
    let tradeTriggerPrice = this.tradeTriggerPrice ? +this.tradeTriggerPrice : undefined;
    tradeTriggerPrice = tradeTriggerPrice && !isNaN(tradeTriggerPrice) && tradeTriggerPrice > 0 ? tradeTriggerPrice : undefined;
    console.log('tradeAmount: ', tradeAmount, ', tradePrice: ', tradePrice, ', tradeTriggerPrice: ', tradeTriggerPrice);

    if (isBuy) {
      if (!tradeAmount) {
        return;
      }
      this.coinService.placeBuyOrder(asset.asset, tradeAmount, tradePrice, tradeTriggerPrice);
    } else {
      this.coinService.placeSellOrder(asset.asset, tradeAmount, tradePrice, tradeTriggerPrice);
    }
  }

  public get isBuyOrSellButtonEnabled(): boolean {
    return this.tradeAmount !== undefined;
  }

  public onClickTableRow(event: Event, assetVm: AssetVm): void {
    (async () => {
      if (!assetVm.trades) {
        await this.coinService.updateTrade(assetVm.asset);
      }
      if (!this.assetWithTradeDetailsOpen || this.assetWithTradeDetailsOpen !== assetVm) {
        this.trades = assetVm.trades;
        this.assetWithTradeDetailsOpen = assetVm;
      } else {
        this.trades = undefined;
        this.assetWithTradeDetailsOpen = undefined;
      }
    })();
    event.stopPropagation();
  }

  public toggleRowDetails(asset: AssetVm): void {
    if (!this.assetWithRowDetailsOpen) {
      asset.areRowDetailsOpen = true;
      this.assetWithRowDetailsOpen = asset;
    } else if (this.assetWithRowDetailsOpen === asset) {
      asset.areRowDetailsOpen = false;
      this.assetWithRowDetailsOpen = undefined;
    } else if (this.moreRowDetailsAtOnce) {
      asset.areRowDetailsOpen = !asset.areRowDetailsOpen;
    } else {
      this.assetWithRowDetailsOpen.areRowDetailsOpen = false;
      asset.areRowDetailsOpen = true;
      this.assetWithRowDetailsOpen = asset;
    }
  }

  public toggleRowDetailsOpenOrderMarket(market: MarketVm): void {
    if (!this.openOrderMarketWithRowDetailsOpen) {
      market.areRowDetailsOpen = true;
      this.openOrderMarketWithRowDetailsOpen = market;
    } else if (this.openOrderMarketWithRowDetailsOpen === market) {
      market.areRowDetailsOpen = false;
      this.openOrderMarketWithRowDetailsOpen = undefined;
    } else if (this.moreRowDetailsAtOnceInOpenOrders) {
      market.areRowDetailsOpen = !market.areRowDetailsOpen;
    } else {
      this.openOrderMarketWithRowDetailsOpen.areRowDetailsOpen = false;
      market.areRowDetailsOpen = true;
      this.openOrderMarketWithRowDetailsOpen = market;
    }
  }

  private syncOpenOrders(): void {
    // Check asset.euroMarket.openOrders en sync deze met assetVm.marketVm.openOrdersVm
    // fill this.markets
    // foreach asset.market:
    // 
    // model -> viewmodel
    const assets = this.coinService.assets;
    Object.keys(assets).forEach(key => {
      const asset = assets[key];
      const assetVm = this.assets.find(a => a.symbol === asset.symbol);
      if (assetVm) {
        assetVm.asset = asset;
      } else {
        throw new Error('Asset does not exist');
      }
    });

    // // tslint:disable-next-line: prefer-const
    // for (let openOrder of openOrders) {
    //   const marketName = openOrder.market;
    //   let market = this.markets.find(m => m.marketName === market);
    //   if (!market) {
    //     market = new MarketVm(openOrder);
    //   }
    //   if(this.openOrderMarkets)



    //   const openOrderVm = this.openOrders.find(o => o.orderId === openOrder.orderId);
    //   if (!openOrderVm) {
    //     const newOpenOrderVm = new OpenOrderVm(openOrder);
    //     this.openOrders.push(newOpenOrderVm);
    //   } else {
    //     openOrderVm.openOrder = openOrder;
    //   }
    // }
    // const listToDelete: OpenOrderVm[] = [];
    // // tslint:disable-next-line: prefer-const
    // for (let openOrderVm of this.openOrders) {
    //   const openOrder = openOrders.find(o => o.orderId === openOrderVm.orderId);
    //   if (!openOrder) {
    //     listToDelete.push(openOrderVm);
    //   }
    // }
    // // tslint:disable-next-line: prefer-const
    // for (let openOrderVm of listToDelete) {
    //   const index = this.openOrders.indexOf(openOrderVm);
    //   if (index > -1) {
    //     this.openOrders.splice(index, 1);
    //   }
    // }
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/