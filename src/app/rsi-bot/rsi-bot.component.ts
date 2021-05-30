import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RsiBotVm } from 'src/view-models/rsi-bot-vm';

@Component({
  selector: 'app-rsi-bot',
  templateUrl: './rsi-bot.component.html',
  styleUrls: ['./rsi-bot.component.scss']
})
export class RsiBotComponent implements OnInit {

  @Input()
  rsiBotVm?: RsiBotVm;

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
