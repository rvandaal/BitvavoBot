import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoinService } from 'src/services/coin-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { BotConfigComponent } from './bot-config/bot-config.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { GridBotComponent } from './grid-bot/grid-bot.component';
import { RsiBotComponent } from './rsi-bot/rsi-bot.component';
import { TradeGroupComponent } from './trade-group/trade-group.component';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    BotConfigComponent,
    GridBotComponent,
    RsiBotComponent,
    TradeGroupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgToggleModule,
    NgSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    NgBootstrapFormValidationModule.forRoot(),
    NgBootstrapFormValidationModule
  ],
  providers: [
    CoinService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
