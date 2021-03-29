import { Component } from '@angular/core';
import { BitvavoService } from 'src/bitvavo.service';
import { Asset } from 'src/models/asset';
import { Assets } from 'src/models/assets';
import { Balance } from 'src/models/balance';
import { TradeHistory } from 'src/models/trade-history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public balance: Balance | undefined;
  public tradeHistory: TradeHistory | undefined;
  public assets: Assets | undefined;
  public assetWhichDetailsAreOpen: Asset | undefined;

  title = 'BitvavoBot';

  constructor(private bitvavoService: BitvavoService) {
    // bitvavoService.getAssets().then(a => {
    //   this.assets = a;
    // });
    (async () => {
      const a = await bitvavoService.getAssets();
      this.assets = a;
      const b = await bitvavoService.getBalance();
      this.balance = b;
  
      // bitvavoService.getBalance().then(bl => {
      //   this.balance = bl;
      // });
  
      if (this.balance && this.assets) {
        for (let bi of this.balance.list) {
          bi.asset = this.assets.getAsset(bi.symbol);
          if (bi.asset) {
            bi.asset.available = bi.available;
            bi.asset.inOrder = bi.inOrder;
            if (bi.totalAmount > 0) {
              this.updateTradeHistory(bi.asset);
            }
          }
        }
      }

      if (this.assets) {
        setInterval(async () => {
          if (this.assets) {
            const tickerPrices = await bitvavoService.getTickerPrices();
            if (tickerPrices) {
              for (let tickerPrice of tickerPrices.list) {
                const index = tickerPrice.market.indexOf('-EUR');
                if (index > -1) {
                  const symbol = tickerPrice.market.substr(0, index);
                  const asset = this.assets.getAsset(symbol);
                  if (asset) {
                    asset.currentPrice = tickerPrice.price;
                  }
                }
              }
            }
          }
        }, 5000);
      }
    })();

  }

  public getAssetName(symbol: string): string | undefined {
    if(this.assets) {
      return this.assets.list.find(a => a.symbol.toLowerCase() === symbol.toLowerCase())?.name;
    }
    return undefined;
  }

  public onClickTableRow(asset: Asset): void {
    (async () => {
      if (!asset.tradeHistory) {
        await this.updateTradeHistory(asset);
      }
      if (!this.assetWhichDetailsAreOpen || this.assetWhichDetailsAreOpen !== asset) {
        this.tradeHistory = asset.tradeHistory;
        this.assetWhichDetailsAreOpen = asset;
      } else {
        this.tradeHistory = undefined;
        this.assetWhichDetailsAreOpen = undefined;
      }
    })();
  }

  private async updateTradeHistory(asset: Asset): Promise<TradeHistory | undefined> {
    if (asset.symbol.toLowerCase() !== 'eur') {
      const tradeHistory = await this.bitvavoService.getTradeHistory(asset);
      if (tradeHistory && asset) {
        asset.tradeHistory = tradeHistory;
      }
      return tradeHistory;
    }
    return undefined;
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/