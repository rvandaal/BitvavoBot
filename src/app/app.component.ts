import { ChangeDetectorRef, Component, InjectionToken, OnInit } from '@angular/core';
import { CoinService } from 'src/services/coin-service';
import { AssetVm } from 'src/view-models/asset-vm';
import { Trade } from 'src/models/trade';
import { MarketVm } from 'src/view-models/market-vm';
import { ITradeVm } from 'src/interfaces/i-trade-vm';
import { TradeGroupVm } from 'src/view-models/trade-group-vm';
import { DatePipe } from '@angular/common';
import { TradeVm } from 'src/view-models/trade-vm';

interface EuroBalanceSnapshot {
  date: Date;
  amount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private euroBalance: EuroBalanceSnapshot[] = [
    {
      date: new Date(2021, 5, 8, 21, 22, 0),
      amount: 20325 // euro
    }
  ];

  // tslint:disable-next-line: variable-name
  private _activeTabId = 2;
  private selectedAssetForTransactionsInternal: AssetVm | undefined;
  private tradeFlatList: TradeVm[] = [];

  public assets: AssetVm[] = [];
  public markets: MarketVm[] = [];
  public tradeGroupRoot: ITradeVm;

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

  // interfaces injecteren: https://stackoverflow.com/questions/53317225/angular-injectiontoken-throws-no-provider-for-injectiontoken

  title = 'BitvavoBot';

  public get activeTabId(): number {
    return this._activeTabId;
  }

  public set activeTabId(value) {
    if (this._activeTabId !== value) {
      this._activeTabId = value;
      this.onTabChange();
    }
  }

  public get selectedAssetForTransactions(): AssetVm | undefined {
    return this.selectedAssetForTransactionsInternal;
  }

  public set selectedAssetForTransactions(value) {
    if (this.selectedAssetForTransactionsInternal !== value) {
      this.selectedAssetForTransactionsInternal = value;
      this.updateTrades();
    }
  }

  public get tradeAmount(): number | undefined {
    const ta = this.tradeAmountRaw ? +this.tradeAmountRaw : undefined;
    return ta && !isNaN(ta) && ta > 0 ? ta : undefined;
  }

  constructor(private coinService: CoinService, private cd: ChangeDetectorRef, private datePipe: DatePipe) {
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
    this.tradeGroupRoot = new TradeGroupVm('root', 'root', 0);

    // this.coinService.openOrders$.subscribe({
    //   next: (openOrders: OpenOrder[]) => {
    //     this.syncOpenOrders(openOrders);
    //   }
    // })
  }

  public ngOnInit(): void {
    (async () => {
      await this.coinService.start();
      setTimeout(() => {
        this.onTabChange();
      }, 2000);
    })();
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
      if (!assetVm.trades || !assetVm.trades.length) {
        await this.coinService.updateTrades(assetVm.asset);
      }
      this.updateTradeVms(assetVm);
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

  private onTabChange(): void {
    switch (this._activeTabId) {
      case 0:
        this.coinService.isBalanceUpdated = true;
        this.coinService.areTickerPricesUpdated = true;
        this.coinService.areTickerPrices24hUpdated = true;
        break;
      case 1:
        this.coinService.isBalanceUpdated = true;
        this.coinService.areTickerPricesUpdated = false;
        this.coinService.areTickerPrices24hUpdated = false;
        break;
      case 2:
        this.coinService.isBalanceUpdated = false;
        this.coinService.areTickerPricesUpdated = false;
        this.coinService.areTickerPrices24hUpdated = false;
        this.updateTrades();
        break;
      case 3:
        this.coinService.isBalanceUpdated = false;
        this.coinService.areTickerPricesUpdated = false;
        this.coinService.areTickerPrices24hUpdated = false;
        break;


    }
  }

  private updateTrades(): void {
    const assetVm = this.selectedAssetForTransactions;
    if (!assetVm) {
      return;
    }
    (async () => {
      await this.coinService.start();
      if (!assetVm.trades || !assetVm.trades.length) {
        await this.coinService.updateTrades(assetVm.asset);
      }
      this.updateTradeVms(assetVm);
      // if (!this.assetWithTradeDetailsOpen || this.assetWithTradeDetailsOpen !== assetVm) {
      //   this.trades = assetVm.trades;
      //   this.assetWithTradeDetailsOpen = assetVm;
      // } else {
      //   this.trades = undefined;
      //   this.assetWithTradeDetailsOpen = undefined;
      // }
    })();
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
    this.cd.detectChanges();
    // todo: delete assetVm's if they are not in the model anymore.
  }

  private updateTradeVms(assetVm: AssetVm): void {
    // asset.trades are not grouped. Group them in the viewmodel.
    const trades = assetVm.asset.trades;
    // tslint:disable-next-line: prefer-const
    for (let trade of trades) {
      const year = trade.date.getFullYear().toString();
      const month = trade.date.getMonth().toString();
      const day = trade.date.getDate().toString();
      const orderId = trade.orderId;
      const tradeId = trade.id;

      let tradeYearVm = this.tradeGroupRoot.children.find(y => y.id === year);
      if (!tradeYearVm) {
        const yearString = this.datePipe.transform(trade.date, 'yyyy');
        if (!yearString) {
          return;
        }
        tradeYearVm = new TradeGroupVm(year, yearString, 1);
        this.tradeGroupRoot.children.push(tradeYearVm);
      }
      let tradeMonthVm = tradeYearVm.children.find(m => m.id === month);
      if (!tradeMonthVm) {
        const monthString = this.datePipe.transform(trade.date, 'MMM');
        if (!monthString) {
          return;
        }
        tradeMonthVm = new TradeGroupVm(month, monthString, 2);
        tradeYearVm.children.push(tradeMonthVm);
      }
      let tradeDayVm = tradeMonthVm.children.find(d => d.id === day);
      if (!tradeDayVm) {
        const dayString = this.datePipe.transform(trade.date, 'dd');
        if (!dayString) {
          return;
        }
        tradeDayVm = new TradeGroupVm(day, dayString, 3);
        tradeMonthVm.children.push(tradeDayVm);
      }
      let tradeDecisionVm = tradeDayVm.children.find(d => d.id === orderId);
      if (!tradeDecisionVm) {
        tradeDecisionVm = new TradeGroupVm(orderId, orderId, 4);
        tradeDayVm.children.push(tradeDecisionVm);
      }
      let tradeVm = tradeDecisionVm.children.find(t => t.id === tradeId);
      if (!tradeVm) {
        tradeVm = new TradeVm(trade.id, trade, 5);
        tradeDecisionVm.children.push(tradeVm);
        if (tradeVm instanceof TradeVm) {
          this.tradeFlatList.push(tradeVm);
        }
      }
    }

    this.updateAfterTradeStatus(assetVm);

    //console.log('trades: ', this.tradeYears);
  }

  private async updateAfterTradeStatus(assetVm: AssetVm): Promise<void> {
    const euroAsset = this.coinService.euroAsset;
    const lastEuroBalanceSnapshot = this.euroBalance[0];
    let isTradeBeforeEuroBalanceSnapshot = false;
    let euroOffset = 0;
    await this.coinService.updateBalance(assetVm.asset);
    console.log('trades: ', this.tradeGroupRoot);
    if (this.tradeFlatList.length) {
      const lastTrade = this.tradeFlatList[0];
      lastTrade.altAmountAfterTrade = assetVm.asset.totalAmount;
      lastTrade.euroAmountAfterTrade = euroAsset.totalAmount;
      if (lastTrade.date && lastTrade.date < lastEuroBalanceSnapshot.date) {
        isTradeBeforeEuroBalanceSnapshot = true;
        euroOffset = lastEuroBalanceSnapshot.amount - lastTrade.euroAmountAfterTrade;
      }
    }
    for (let i = 1; i < this.tradeFlatList.length; i++) {
      const trade = this.tradeFlatList[i];
      const previousTrade = this.tradeFlatList[i - 1];
      trade.altAmountAfterTrade = previousTrade.altAmountAfterTrade - previousTrade.amount;
      trade.euroAmountAfterTrade =
        previousTrade.euroAmountAfterTrade + previousTrade.amount * previousTrade.price + previousTrade.fee;
      if (trade.date && !isTradeBeforeEuroBalanceSnapshot && trade.date < lastEuroBalanceSnapshot.date) {
        euroOffset = lastEuroBalanceSnapshot.amount - trade.euroAmountAfterTrade;
        isTradeBeforeEuroBalanceSnapshot = true;
      }
    }

    if (euroOffset !== 0) {
      for (const trade of this.tradeFlatList) {
        trade.euroAmountAfterTrade += euroOffset;
      }
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
