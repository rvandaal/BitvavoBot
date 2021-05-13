export class TradeResponse {
    public readonly id: string;
    public readonly orderId: string;
    public readonly market: string;
    public readonly amount: number;
    public readonly price: number;
    public readonly isBuy: boolean;
    public readonly date: Date;
    public readonly fee: number;
    public settled: boolean;

    constructor(item: any) {
        this.id = item.id;
        this.orderId = item.orderId;
        this.market = item.market;
        this.amount = +item.amount;
        this.price = +item.price;
        this.isBuy = item.side === 'buy';
        this.date = new Date(item.timestamp);
        this.fee = +item.fee;
        this.settled = item.settled === true;
    }
}