export class Trade {
    public readonly market: string;
    public amount: number;
    public readonly price: number;
    public readonly isBuy: boolean;
    public readonly date: Date;
    public fee: number;
    public totalAmount: number;
    public euroAmount: number;
    public totalEuroAmount: number;

    constructor(market: string, amount: number, price: number, isBuy: boolean, date: Date, fee: number) {
        this.market = market;
        this.amount = amount;
        this.price = price;
        this.isBuy = isBuy;
        this.date = date;
        this.fee = fee;
        this.totalAmount = 0;
        this.euroAmount = 0;
        this.totalEuroAmount = 0;
    }
}