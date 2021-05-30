import { RsiIndicator } from 'src/indicators/rsi-indicator';
import { IBotService } from 'src/interfaces/i-bot-service';
import { loga } from 'src/logr';
import { Trade } from 'src/models/trade';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { Bot } from './bot';
import { IRsiConfig } from './i-rsi-config';
import { takeUntil } from 'rxjs/operators';

export class RsiBot extends Bot {

    private candleResponses: CandleResponse[] = [];

    private rsi: number[] | undefined;

    private isEverythingSold = true;

    public tradeAmountInAltPerGridLine = 0;
    public feePaid = 0;

    public get totalInvestmentInEuro(): number {
        return this.config.totalInvestmentInEuro;
    }

    constructor(private config: IRsiConfig, botService: IBotService) {
        super(config.asset, botService);
    }

    @loga()
    public async start(): Promise<void> {
        await super.start();

        // make initial investment
        if (this.config.startWithOverbought === true) {
            await this.placeInitialBuyOrder();
        }

        this.botService.registerForCandles(this.asset, 60, '1m').pipe(takeUntil(this.destroy$)).subscribe(candleResponses => {
            this.candleResponses = candleResponses;
            this.rsi = RsiIndicator.getRsi(this.candleResponses, 14, 2);
            if (this.shouldInitialBuyBeMade()) {
                this.placeInitialBuyOrder();
            }
            this.processRsi();
        });
    }

    public async processFilledOrder(_1: string, _2: Trade[]): Promise<boolean> {
        return false;
    }

    private shouldInitialBuyBeMade(): boolean {
        // If startWithOverbought is not set, determine ourselves if the initial buy should be made
        return this.config.startWithOverbought === undefined &&
            !this.isInitialInvestmentMade &&
            this.rsi?.length !== undefined &&
            this.rsi[0] > 50;
    }

    private async processRsi(): Promise<void> {
        if (
            !this.isEverythingSold &&
            this.rsi &&
            (
                this.rsi.length === 1 && this.rsi[0] > 70 ||
                this.rsi.length > 1 && this.rsi[0] < 70 && this.rsi[1] > 70
            )
        ) {
            await this.sell();
        } else if (
            this.isEverythingSold && this.rsi &&
            (
                this.rsi.length === 1 && this.rsi[0] < 30 ||
                this.rsi.length > 1 && this.rsi[0] > 30 && this.rsi[1] < 30
            )
        ) {
            await this.buy();
        }
    }

    protected placeInitialBuyOrder(): Promise<PlaceOrderResponse> {
        // amounteuro = amountalt * price * (1 + fee)
        if (!this.fee) {
            throw new Error('fee is not known');
        }
        this.estimatedInitialInvestmentInAlt = this.config.totalInvestmentInEuro / this.currentPrice / (1 + this.fee.taker);
        return super.placeInitialBuyOrder();
    }

    private async buy(): Promise<void> {
        const placeOrderResponse = await this.botService.placeBuyOrder(this.asset, this.initialInvestmentInAlt, undefined);
        if (!placeOrderResponse) {
            return Promise.reject();
        }
        const fill = placeOrderResponse.fills[0];
        this.currentValueInAlt += fill.amount;
        this.currentCashInEuro -= fill.buyFillCostInEuro;
    }

    private async sell(): Promise<void> {
        const placeOrderResponse = await this.botService.placeSellOrder(this.asset, this.initialInvestmentInAlt, undefined);
        if (!placeOrderResponse) {
            return Promise.reject();
        }
        const fill = placeOrderResponse.fills[0];
        this.currentValueInAlt -= fill.amount;
        this.currentCashInEuro += fill.sellFillGainInEuro;
    }
}
