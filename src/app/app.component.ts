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

  title = 'BitvavoBot';

  constructor(bitvavoService: BitvavoService) {
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
            if (bi.symbol.toLowerCase() !== 'eur' && bi.totalAmount > 0) {
              bitvavoService.getTradeHistory(bi.asset).then(th => {
                if (th && bi.asset) {
                  bi.asset.tradeHistory = th;
                }
              });
            }
          }
        }
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
    console.log('Asset: ', asset);
    this.tradeHistory = asset.tradeHistory;
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/