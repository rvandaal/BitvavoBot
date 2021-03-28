import { Component } from '@angular/core';
import { BitvavoService } from 'src/bitvavo.service';
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
  title = 'BitvavoBot';

  constructor(bitvavoService: BitvavoService) {
    const balanceList = bitvavoService.getBalance().then(bl => {
      this.balance = bl;
    });

    const tradeHistoryList = bitvavoService.getTradeHistory().then(th => {
      this.tradeHistory = th;
    });
  }
}

// https://www.techiediaries.com/fix-cors-with-angular-cli-proxy-configuration/