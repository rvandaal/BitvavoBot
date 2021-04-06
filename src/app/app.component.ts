import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetDictionary, CoinService } from 'src/services/coin-service';
import { AssetVm } from 'src/view-models/asset-vm';
import { map } from 'rxjs/operators';
import { Trade } from 'src/models/trade';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public assets: AssetVm[] = [];

  public trades: Trade[] | undefined;
  public assetWithTradeDetailsOpen: AssetVm | undefined;
  public showAllCoins = true;
  public moreRowDetailsAtOnce = false;
  public assetWithRowDetailsOpen: AssetVm | undefined;
  public tradeAmount: string | undefined;
  public tradePrice: string | undefined;
  public tradeTriggerPrice: string | undefined;

  title = 'BitvavoBot';

  constructor(private coinService: CoinService, cd: ChangeDetectorRef) {
    const sortFunc = (a: AssetVm, b: AssetVm) => {
      const br = b.relativeChange;
      const ar = a.relativeChange;
      //return !br && !ar ? b.change24h - a.change24h : br && !ar ? 1 : !br && ar ? -1 : br && ar ? br - ar : 0;
      //return b.numberOfSubsequentIncreasements - a.numberOfSubsequentIncreasements;
      return b.totalAmount - a.totalAmount;
    };
    this.coinService.assets$.subscribe({
      next: (assets: AssetDictionary) => {
        Object.keys(assets).forEach(key => {
          const asset = assets[key];
          const assetVm = this.assets.find(a => a.symbol === asset.symbol);
          if (!assetVm) {
            const newAssetVm = new AssetVm(asset);
            this.assets.push(newAssetVm);
          }
        });
      }
    });
    this.coinService.start();
    //cd.detectChanges();
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
    return this.tradeAmount !== undefined && this.tradeAmount !== '';
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
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/