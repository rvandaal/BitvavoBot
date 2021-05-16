import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Asset } from 'src/models/asset';
import { BotService, BotType } from 'src/services/bot.service';
import { GridBot } from 'src/trading/grid-bot';
import { IGridConfig } from 'src/trading/i-grid-config';
import { GridBotVm } from 'src/view-models/grid-bot-vm';

@Component({
  selector: 'app-bot-config',
  templateUrl: './bot-config.component.html',
  styleUrls: ['./bot-config.component.scss']
})
export class BotConfigComponent implements OnInit {

  botTypes: BotType[];

  formGroup: FormGroup;

  gridBotVms: GridBotVm[] = [];

  constructor(private botService: BotService) {
    this.botTypes = ['grid'];

    this.formGroup = new FormGroup({
      selectedAsset: new FormControl('ADA', Validators.required),
      selectedBotType: new FormControl('grid', Validators.required),
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
      useHalfRange: new FormControl(true)
    });
  }

  ngOnInit(): void {
    
  }

  public get assets(): Asset[] {
    return this.botService.assets;
  }

  public onStartBot(): void {
    const asset = this.botService.assets.find(a => a.symbol === this.formGroup.value['selectedAsset']);
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
        const gridBot = this.botService.startGridBot(gridConfig);
        this.gridBotVms.push(new GridBotVm(gridBot));
      }
    }
  }

  public async onStopBot(gridBotVm: GridBotVm) {
    await this.botService.stopBot(gridBotVm.bot);
    const index = this.gridBotVms.indexOf(gridBotVm);
    this.gridBotVms.splice(index, 1);
  }

  public onReset() {
    this.formGroup.reset({ selectedAsset: 'ETH', selectedBotType: 'grid', useHalfRange: true });
  }

}
