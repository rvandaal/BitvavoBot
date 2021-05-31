// Performs trading for one particular coin
// Multiple coinbots can exist for the same coin, each with different settings

import { Subject } from 'rxjs';
import { promise } from 'selenium-webdriver';
import { IBotService } from 'src/interfaces/i-bot-service';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { Trade } from 'src/models/trade';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';

// bot shouldn't make http calls, it should communicate to the IBotService what it wants.
// In case of backtesting we don't make http calls, only at start up.

export class Bot {

    // mss de orders doorgeven aan de hoofdbot zodat deze kan controleren
    // of het bedrag niet te groot is. Ook kan deze subscriben om te kijken
    // of een order gefilled is.

    protected destroy$: Subject<boolean> = new Subject<boolean>();
    protected isActive = false;

    protected get fee(): Fee | undefined {
        return this.botService.fee;
    }

    protected isInitialInvestmentMade = false;
    protected estimatedInitialInvestmentInEuro = 0;
    protected estimatedInitialInvestmentInAlt = 0;

    public currentValueInAlt = 0;
    public currentCashInEuro = 0;
    public feePaid = 0;
    public numberOfBuyOrdersFilled = 0;
    public numberOfSellOrdersFilled = 0;

    public initialInvestmentInAlt = 0;
    public initialInvestmentPrice = 0;
    public initialFee = 0;

    public get initialInvestmentInEuro(): number {
        return this.initialInvestmentInAlt * this.initialInvestmentPrice + this.initialFee;
    }

    public get totalInvestmentInEuro(): number {
        return 0;
    }

    public get currentPrice(): number {
        return this.botService.currentPrice;
    }

    public get currentValueInEuro(): number {
        return this.asset.currentValueInEuro;
    }

    public get profitWithoutBot(): number {
        return this.initialInvestmentInAlt * this.currentPrice - this.initialInvestmentInEuro;
    }

    public get profitWithBot(): number {
        return this.currentValueInAlt * this.currentPrice + this.currentCashInEuro - this.initialInvestmentInEuro;
    }

    public get profitFromBot(): number {
        return this.profitWithBot - this.profitWithoutBot;
    }

    constructor(public readonly asset: Asset, protected botService: IBotService) {

    }

    public async start(): Promise<void> {
        if (this.isActive) {
            return Promise.reject();
        }
        this.isActive = true;
    }

    public async stop(): Promise<void> {
        await this.sellAll();
        this.destroy$.next(true);
    }

    public processFilledOrder(orderId: string, trades: Trade[]): Promise<boolean> {
        return Promise.reject();
    }

    protected async placeInitialBuyOrder(): Promise<PlaceOrderResponse> {
        if (!this.fee) {
            return Promise.reject();
        }
        // todo: await this.botService.updateBalance(); // check the balance before buying something
        this.estimatedInitialInvestmentInAlt = this.estimatedInitialInvestmentInEuro / this.currentPrice / (1 + this.fee.taker);
        console.log('Place initial buy order: ' + this.estimatedInitialInvestmentInAlt + ' ALT');
        const placeOrderResponse = await this.botService.placeBuyOrder(this.asset, this.estimatedInitialInvestmentInAlt, undefined);
        if (!placeOrderResponse) {
            return Promise.reject();
        }
        console.log('Order placed');
        const fill = placeOrderResponse.fills[0];
        this.initialInvestmentInAlt = fill.amount;
        this.currentValueInAlt = this.initialInvestmentInAlt;
        this.currentCashInEuro -= fill.buyFillCostInEuro;
        this.initialInvestmentPrice = fill.price;
        this.initialFee = fill.fee;
        this.isInitialInvestmentMade = true;
        console.log(
            'Initial investment in alt: ',
            this.initialInvestmentInAlt,
            ' coins; against price: ',
            this.initialInvestmentPrice,
            '; cost in euro: ',
            this.initialInvestmentInEuro
        );
        return placeOrderResponse;
    }

    private async sellAll(): Promise<void> {
        await this.botService.updateBalance();
        await this.botService.placeSellOrder(this.asset, this.currentValueInAlt, undefined);
    }
}
