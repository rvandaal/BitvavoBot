import { ITradeVm } from 'src/interfaces/i-trade-vm';

export class TradeGroupVm implements ITradeVm {
    public children: ITradeVm[];
    public areRowDetailsOpen = false;
    public profit = 0;
    public priceAtWhichTargetIsReachedAfterSellingAll = 0;
    public priceAtWhichTargetIsReachedWithCurrentCash = 0;

    public get hasChildren(): boolean {
        return this.children.length > 0;
    }

    public get goodCall(): boolean {
        return this.profit > 0;
    }

    public get date(): Date | undefined {
        if (this.hasChildren) {
            return this.children[0].date;
        }
        return undefined;
    }

    public get amount(): number {
        return this.children.map(c => c.amount).reduce((acc, cur) => acc + cur);
    }

    public get price(): number {
        if (Math.abs(this.amount) < 0.01) {
            return 0;
        }
        return this.children.map(c => c.amount * c.price).reduce((acc, cur) => acc + cur) / this.amount;
    }

    public get fee(): number {
        return this.children.map(c => c.fee).reduce((acc, cur) => acc + cur);
    }

    public get altAmountAfterTrade(): number {
        return this.hasChildren ? this.children[0].altAmountAfterTrade : 0;
    }

    public get cashAfterTrade(): number {
        return this.hasChildren ? this.children[0].cashAfterTrade : 0;
    }

    public get grandTotalInEuroWhenThisWasLastTrade(): number {
        return this.hasChildren ? this.children[0].grandTotalInEuroWhenThisWasLastTrade : 0;
    }

    constructor(public id: string, public name: string, public level: number) {
        this.children = [];
    }

    public toggleRowDetails(): void {
        this.areRowDetailsOpen = !this.areRowDetailsOpen;
    }
}
