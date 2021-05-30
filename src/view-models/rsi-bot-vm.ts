import { Asset } from 'src/models/asset';
import { RsiBot } from 'src/trading/rsi-bot';
import { BotVm } from './bot-vm';

export class RsiBotVm extends BotVm{
    constructor(public bot: RsiBot) {
        super(bot);
    }
}
