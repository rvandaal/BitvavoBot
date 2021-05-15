// Performs trading for one particular coin
// Multiple coinbots can exist for the same coin, each with different settings

import { Asset } from 'src/models/asset';
import { Trade } from 'src/models/trade';

export class Bot {

    // mss de orders doorgeven aan de hoofdbot zodat deze kan controleren 
    // of het bedrag niet te groot is. Ook kan deze subscriben om te kijken
    // of een order gefilled is.

    public readonly asset: Asset; // todo: must be market instead of asset

    constructor(asset: Asset) {
        this.asset = asset;
    }

    public async start(): Promise<void> {}

    public async stop(): Promise<void> {}

    public processFilledOrder(orderId: string, trades: Trade[]): boolean {
        return false;
    }
}