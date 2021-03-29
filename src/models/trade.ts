export class Trade {
    public readonly market: string;
    public readonly amount: number;
    public readonly price: number;
    public readonly isBuy: boolean;
    public readonly date: Date;
    public readonly fee: number;

    constructor(item: any) {
        this.market = item.market;
        this.amount = +item.amount;
        this.price = +item.price;
        this.isBuy = item.side === 'buy';
        this.date = new Date(item.timestamp);
        this.fee = +item.fee;
    }
}