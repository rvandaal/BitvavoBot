import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Asset } from 'src/models/asset';
import { BotsService, BotType } from 'src/services/bots.service';
import { GridBot } from 'src/trading/grid-bot';
import { IGridConfig } from 'src/trading/i-grid-config';
import { IRsiConfig } from 'src/trading/i-rsi-config';
import { GridBotVm } from 'src/view-models/grid-bot-vm';
import { RsiBotVm } from 'src/view-models/rsi-bot-vm';

// tslint:disable-next-line: no-string-literal

@Component({
  selector: 'app-bot-config',
  templateUrl: './bot-config.component.html',
  styleUrls: ['./bot-config.component.scss']
})
export class BotConfigComponent implements OnInit {

  botTypes: BotType[];
  candleIntervals: string[];

  formGroup: FormGroup;

  gridBotVms: GridBotVm[] = [];
  rsiBotVms: RsiBotVm[] = [];

  botProfit: number | undefined;

  constructor(private botsService: BotsService) {
    this.botTypes = ['grid', 'rsi'];
    this.candleIntervals = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d'];

    this.formGroup = new FormGroup({
      selectedAsset: new FormControl('ADA', Validators.required),
      selectedBotType: new FormControl('rsi', Validators.required),
      totalInvestment: new FormControl(100, [
        Validators.required,
        Validators.pattern(/^[0-9\.]*$/)
      ]),
      numberOfGridLines: new FormControl(3, [
        Validators.required,
        Validators.pattern(/^[0-9\.]*[13579]$/)
      ]),
      halfRange: new FormControl(0.01, [
        Validators.pattern(/^[0-9\.]*$/)
      ]),
      minBoundaryRange: new FormControl(null, [
        Validators.pattern(/^[0-9\.]*$/)
      ]),
      maxBoundaryRange: new FormControl(null, [
        Validators.pattern(/^[0-9\.]*$/)
      ]),
      useHalfRange: new FormControl(true),
      candleInterval: new FormControl('1m', [
        Validators.required
      ]),
      rsiPeriod: new FormControl(14, [
        Validators.required,
        Validators.pattern(/^[0-9\.]*$/)
      ]),
      startWithOverbought: new FormControl(undefined)
    });
  }

  ngOnInit(): void {

  }

  public get assets(): Asset[] {
    return this.botsService.assets;
  }

  public onStartBot(): void {
    const asset = this.botsService.assets.find(a => a.symbol === this.formGroup.value['selectedAsset']);
    if (asset) {
      if (this.formGroup.value['selectedBotType'] === 'grid'){
        const gridConfig: IGridConfig = {
          asset,
          numberOfGridLines: this.formGroup.value['numberOfGridLines'],
          totalInvestmentInEuro: +this.formGroup.value['totalInvestment'],
          useHalfRange: this.formGroup.value['useHalfRange'],
          halfRange: +this.formGroup.value['halfRange'],
          minBoundary: +this.formGroup.value['minBoundaryRange'],
          maxBoundary: +this.formGroup.value['maxBoundaryRange'],
        };
        console.log(gridConfig);
        const gridBot = this.botsService.startGridBot(gridConfig);
        this.gridBotVms.push(new GridBotVm(gridBot));
      } else if (this.formGroup.value['selectedBotType'] === 'rsi'){
        const rsiConfig: IRsiConfig = {
          asset,
          totalInvestmentInEuro: +this.formGroup.value['totalInvestment'],
          candleInterval: this.formGroup.value['candleInterval'],
          rsiPeriod: +this.formGroup.value['rsiPeriod'],
          startWithOverbought: this.formGroup.value['startWithOverbought']
        };
        console.log(rsiConfig);
        const rsiBot = this.botsService.startRsiBot(rsiConfig);
        this.rsiBotVms.push(new RsiBotVm(rsiBot));
      }
    }
  }

  public async onStopBot(gridBotVm: GridBotVm): Promise<void> {
    await this.botsService.stopBot(gridBotVm.bot);
    const index = this.gridBotVms.indexOf(gridBotVm);
    this.gridBotVms.splice(index, 1);
  }

  public onReset(): void {
    this.formGroup.reset({ selectedAsset: 'ETH', selectedBotType: 'rsi', useHalfRange: true });
  }

  public async onBacktestBot(): Promise<void> {
    const asset = this.botsService.assets.find(a => a.symbol === this.formGroup.value['selectedAsset']);
    if (asset) {
      if (this.formGroup.value['selectedBotType'] === 'grid'){
        const gridConfig: IGridConfig = {
          asset,
          numberOfGridLines: this.formGroup.value['numberOfGridLines'],
          totalInvestmentInEuro: +this.formGroup.value['totalInvestment'],
          useHalfRange: this.formGroup.value['useHalfRange'],
          halfRange: +this.formGroup.value['halfRange'],
          minBoundary: +this.formGroup.value['minBoundaryRange'],
          maxBoundary: +this.formGroup.value['maxBoundaryRange'],
        };
        console.log(gridConfig);
        const gridBot = await this.botsService.backtestGridBot(gridConfig);
        this.botProfit = gridBot.profitFromBot;
      } else if (this.formGroup.value['selectedBotType'] === 'rsi'){
        const rsiConfig: IRsiConfig = {
          asset,
          totalInvestmentInEuro: +this.formGroup.value['totalInvestment'],
          candleInterval: this.formGroup.value['candleInterval'],
          rsiPeriod: +this.formGroup.value['rsiPeriod'],
          startWithOverbought: this.formGroup.value['startWithOverbought']
        };
        console.log(rsiConfig);
        const rsiBot = await this.botsService.backtestRsiBot(rsiConfig);
        this.botProfit = rsiBot.profitFromBot;
      }
    }
  }

}
