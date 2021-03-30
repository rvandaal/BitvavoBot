import { Component } from '@angular/core';
import { BitvavoService } from 'src/bitvavo.service';
import { Asset } from 'src/models/asset';
import { Assets } from 'src/models/assets';
import { Balances } from 'src/models/balances';
import { Trades } from 'src/models/trades';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public balance: Balances | undefined;
  public trades: Trades | undefined;
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
              this.updateTrades(bi.asset);
            }
          }
        }
      }

      if (this.assets) {
        this.updateCurrentPrice();
        this.updateChange24h();

        setInterval(async () => {
          if (this.assets) {
            await this.updateCurrentPrice();
            await this.updateChange24h();
          }
        }, 5000);
      }
    })();
  }

  public getAssetName(symbol: string): string | undefined {
    if (this.assets) {
      return this.assets.list.find(a => a.symbol === symbol)?.name;
    }
    return undefined;
  }

  public onClickTableRow(asset: Asset): void {
    (async () => {
      if (!asset.trades) {
        await this.updateTrades(asset);
      }
      if (!this.assetWhichDetailsAreOpen || this.assetWhichDetailsAreOpen !== asset) {
        this.trades = asset.trades;
        this.assetWhichDetailsAreOpen = asset;
      } else {
        this.trades = undefined;
        this.assetWhichDetailsAreOpen = undefined;
      }
    })();
  }

  private async updateCurrentPrice(): Promise<void> {
    const tickerPrices = await this.bitvavoService.getTickerPrices();
    if (tickerPrices && this.assets) {
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

  private async updateChange24h(): Promise<void> {
    // todo: changes24h komen niet overeen met die van bitvavo
    const tickerPrices24h = await this.bitvavoService.getTickerPrices24h();
    if (tickerPrices24h && this.assets) {
      for (let tickerPrice24h of tickerPrices24h.list) {
        const index = tickerPrice24h.market.indexOf('-EUR');
        if (index > -1) {
          const symbol = tickerPrice24h.market.substr(0, index);
          const asset = this.assets.getAsset(symbol);
          if (asset) {
            asset.price24hAgo = tickerPrice24h.open;
          }
        }
      }
    }
  }

  private async updateTrades(asset: Asset): Promise<Trades | undefined> {
    if (asset.symbol !== 'EUR') {
      const trades = await this.bitvavoService.getTrades(asset);
      if (trades && asset) {
        asset.trades = trades;
      }
      return trades;
    }
    return undefined;
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/