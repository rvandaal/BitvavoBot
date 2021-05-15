import { GridBot } from 'src/trading/grid-bot';

export class GridBotVm {
    constructor(public bot: GridBot) {

    }

    public get profitFromBot(): number {
        return this.bot.profitFromBot;
    }
}