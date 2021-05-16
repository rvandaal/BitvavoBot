import { Asset } from 'src/models/asset';
import { GridBot } from 'src/trading/grid-bot';

export class GridBotVm {
    constructor(public bot: GridBot) {

    }

    public get asset(): Asset {
        return this.bot.asset;
    }

    public get initialInvestmentInAlt(): number {
        return this.bot.initialInvestmentInAlt;
    }

    public get initialInvestmentPrice(): number {
        return this.bot.initialInvestmentPrice;
    }

    public get initialFee(): number {
        return this.bot.initialFee;
    }

    public get initialInvestmentInEuro(): number {
        return this.bot.initialInvestmentInEuro;
    }

    public get totalInvestmentInEuro(): number {
        return this.bot.totalInvestmentInEuro;
    }

    public get numberOfGridLines(): number {
        return this.bot.numberOfGridLines;
    }

    public get gridLineDistance(): number {
        return this.bot.gridLineDistance;
    }

    public get tradeAmountInAltPerGridLine(): number {
        return this.bot.tradeAmountInAltPerGridLine;
    }

    public get numberOfBuyOrdersFilled(): number {
        return this.bot.numberOfBuyOrdersFilled;
    }

    public get numberOfSellOrdersFilled(): number {
        return this.bot.numberOfSellOrdersFilled;
    }

    public get currentValueInAlt(): number {
        return this.bot.currentValueInAlt;
    }

    public get currentCashInEuro(): number {
        return this.bot.currentCashInEuro;
    }

    public get feePaid(): number {
        return this.bot.feePaid;
    }

    public get currentPrice(): number {
        return this.bot.currentPrice;
    }

    public get profitWithoutBot(): number {
        return this.bot.profitWithoutBot;
    }

    public get profitWithBot(): number {
        return this.bot.profitWithBot;
    }

    public get profitFromBot(): number {
        return this.bot.profitFromBot;
    }
}