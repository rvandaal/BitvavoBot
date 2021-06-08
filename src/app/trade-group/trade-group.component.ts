import { Component, Input, OnInit } from '@angular/core';
import { ITradeVm } from 'src/interfaces/i-trade-vm';

@Component({
  selector: 'app-trade-group',
  templateUrl: './trade-group.component.html',
  styleUrls: ['./trade-group.component.scss']
})
export class TradeGroupComponent implements OnInit {

  @Input()
  viewModel: ITradeVm | undefined;

  public caption: string | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public toggleRowDetailsOpenOrderMarket(): void {
    if(this.viewModel) {
      this.viewModel.areRowDetailsOpen = !this.viewModel.areRowDetailsOpen;
    }
  }

}
