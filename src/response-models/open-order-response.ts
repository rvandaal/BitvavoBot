export class OpenOrderResponse {
    public readonly orderId: string;
    public readonly market: string;
    public readonly created: Date;
    public readonly updated: Date;
    public readonly status: string;
    public readonly isBuy: boolean;
    public readonly orderType: string;
    public readonly amount: number;
    public readonly amountRemaining: number;
    public readonly filledAmount: number;
    public readonly price: number;
    public readonly amountQuote: number;
    public readonly amountQuoteRemaining: number;

    constructor(item: any) {
        this.orderId = item.orderId;
        this.market = item.market;
        this.created = new Date(item.created);
        this.updated = new Date(item.updated);
        this.status = item.status;
        this.isBuy = item.side === 'buy';
        this.orderType = item.orderType;
        this.amount = +item.amount;
        this.amountRemaining = +item.amountRemaining;
        this.filledAmount = +item.filledAmount;
        this.amountQuote = +item.amountQuote;
        this.amountQuoteRemaining = +item.amountQuoteRemaining;
        this.price = +item.price;
    }
}