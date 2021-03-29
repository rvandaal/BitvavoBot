export class GroupedTrade {
    public readonly market: string;
    public amount: number;
    public totalAmount: number;
    public price: number;
    public readonly isBuy: boolean;
    public readonly date: Date;
    public fee: number;
    public euroAmount: number;
    public totalEuroAmount: number;

    constructor(market: string, amount: number, price: number, isBuy: boolean, date: Date, fee: number, euroAmount: number) {
        this.market = market;
        this.amount = amount;
        this.fee = fee;
        this.price = price;
        this.isBuy = isBuy;
        this.date = date;
        this.totalAmount = 0;
        this.euroAmount = euroAmount;
        this.totalEuroAmount = 0;
    }
}