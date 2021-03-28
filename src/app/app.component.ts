import { Component } from '@angular/core';
import { BitvavoService } from 'src/bitvavo.service';
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
    bitvavoService.getAssets().then(a => {
      this.assets = a;
    });

    bitvavoService.getBalance().then(bl => {
      this.balance = bl;
    });

    bitvavoService.getTradeHistory().then(th => {
      this.tradeHistory = th;
    });
  }

  public getAssetName(symbol: string): string | undefined {
    if(this.assets) {
      return this.assets.list.find(a => a.symbol.toLowerCase() === symbol.toLowerCase())?.name;
    }
    return undefined;
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/