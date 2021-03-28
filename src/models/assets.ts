import { Asset } from './asset';

export class Assets {
    constructor(public readonly list: Asset[]){
    }

    public get sortedList(): Asset[] {
        const sortFunc = (a, b) => b.available - a.available;
        return this.list.sort(sortFunc);
    }

    public getAsset(symbol: string): Asset | undefined {
        return this.list.find(a => a.symbol === symbol);
    }
}