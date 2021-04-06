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

  public assets$: Observable<AssetVm[]>;

  public trades: Trade[] | undefined;
  public assetWithTradeDetailsOpen: AssetVm | undefined;
  public showAllCoins = true;
  public moreRowDetailsAtOnce = false;
  public assetWithRowDetailsOpen: AssetVm | undefined;

  title = 'BitvavoBot';

  constructor(private coinService: CoinService, cd: ChangeDetectorRef) {
    const sortFunc = (a: AssetVm, b: AssetVm) => {
      const br = b.relativeChange;
      const ar = a.relativeChange;
      //return !br && !ar ? b.change24h - a.change24h : br && !ar ? 1 : !br && ar ? -1 : br && ar ? br - ar : 0;
      return b.numberOfSubsequentIncreasements - a.numberOfSubsequentIncreasements;
    };
    this.assets$ = this.coinService.assets$.pipe(
      map((assets: AssetDictionary): AssetVm[] => {
        return Object.keys(assets).map(key => {
          const assetVm = new AssetVm(assets[key]);
          if (this.assetWithRowDetailsOpen && this.assetWithRowDetailsOpen.symbol === key) {
             this.assetWithRowDetailsOpen = assetVm;
             assetVm.areRowDetailsOpen = true;
          }
          return assetVm;
        }).sort(sortFunc);
      })
    );
    this.coinService.start();
    //cd.detectChanges();
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