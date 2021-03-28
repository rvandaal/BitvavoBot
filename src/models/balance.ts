import { BalanceItem } from './balance-item';

export class Balance {
    constructor(public readonly list: BalanceItem[]) { }

    public get noEmptyList(): BalanceItem[] {
        const sortFunc = (a, b) => b.available - a.available;
        //return this.list.filter(bi => bi.available > 0).sort(sortFunc);
        return this.list.sort(sortFunc);
    }
}