import { Asset } from 'src/models/asset';
import { GridBot } from 'src/trading/grid-bot';
import { BotVm } from './bot-vm';

export class GridBotVm extends BotVm{
    constructor(public bot: GridBot) {
        super(bot);
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
}
