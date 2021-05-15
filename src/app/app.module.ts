import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BotService } from 'src/services/bot.service';
import { CoinService } from 'src/services/coin-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { BotConfigComponent } from './bot-config/bot-config.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgBootstrapFormValidationModule } from 'ng-bootstrap-form-validation';
import { GridBotComponent } from './grid-bot/grid-bot.component';

@NgModule({
  declarations: [
    AppComponent,
    BotConfigComponent,
    GridBotComponent
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
    BotService,
    CoinService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
