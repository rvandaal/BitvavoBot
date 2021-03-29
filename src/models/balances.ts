import { Balance } from './balance';

export class Balances {
    constructor(public readonly list: Balance[]) { }

    public get noEmptyList(): Balance[] {
        const sortFunc = (a, b) => b.available - a.available;
        //return this.list.filter(bi => bi.available > 0).sort(sortFunc);
        return this.list.sort(sortFunc);
    }
}