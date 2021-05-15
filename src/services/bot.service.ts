import { Injectable } from '@angular/core';
import { Asset } from 'src/models/asset';
import { CoinService } from './coin-service';

export type BotType = 'grid';

@Injectable({
  providedIn: 'root'
})
export class BotService {

  public assets: Asset[];

  constructor(private coinService: CoinService) {
    // Assumption: coinservice has been started
    this.assets = Object.keys(this.coinService.assets).map(k => this.coinService.assets[k]);
  }
}
