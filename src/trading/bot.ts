// Performs trading for one particular coin
// Multiple coinbots can exist for the same coin, each with different settings

import { Asset } from 'src/models/asset';
import { Trade } from 'src/models/trade';

export class Bot {
    // private positions: Position[];
    // private config: BotConfig
    // private market: string;
    // public start(): void {}
    // public stop(): void {}
    // public pause(): void {}
    // public resume(): void {}

    // mss de orders doorgeven aan de hoofdbot zodat deze kan controleren 
    // of het bedrag niet te groot is. Ook kan deze subscriben om te kijken
    // of een order gefilled is.

    public readonly asset: Asset;

    constructor(asset: Asset) {
        this.asset = asset;
    }

    public processFilledOrder(orderId: string, trades: Trade[]): boolean {
        return false;
    }
    
}