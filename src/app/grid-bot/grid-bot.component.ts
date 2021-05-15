import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GridBotVm } from 'src/view-models/grid-bot-vm';

@Component({
  selector: 'app-grid-bot',
  templateUrl: './grid-bot.component.html',
  styleUrls: ['./grid-bot.component.scss']
})
export class GridBotComponent implements OnInit {

  @Input()
  gridBotVm?: GridBotVm;

  @Output()
  stopBotEvent = new EventEmitter<void>();

  constructor() {

  }

  ngOnInit(): void {
  }

  public onStopBot(): void {
    this.stopBotEvent.emit();
  }

}
