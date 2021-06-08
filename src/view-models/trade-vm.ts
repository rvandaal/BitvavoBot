import { ITradeVm } from 'src/interfaces/i-trade-vm';
import { Trade } from 'src/models/trade';

export class TradeVm implements ITradeVm {

    public name = '';
    public children: ITradeVm[];
    public areRowDetailsOpen = false;
    public altAmountAfterTrade = 0;
    public euroAmountAfterTrade = 0;

    public get hasChildren(): boolean {
        return this.children.length > 0;
    }

    constructor(public id: string, public trade: Trade, public level: number) {
        this.children = [];
        this.name = id;
    }

    public get date(): Date | undefined {
        return this.trade.date;
    }

    public get amount(): number {
        return (this.isBuy ? 1 : -1) * this.trade.amount;
    }

    public get price(): number {
        return this.trade.price;
    }

    public get fee(): number {
        return this.trade.fee;
    }

    public get isBuy(): boolean {
        return this.trade.isBuy;
    }

    public toggleRowDetails(): void {
        // do nothing, this is a leaf view model
    }
}
