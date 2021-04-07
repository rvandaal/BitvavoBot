export class PlaceOrderResponse {
    public readonly orderId: string;
    public readonly amount: number;
    public readonly amountRemaining: number;
    public readonly created: Date;
    public readonly filledAmount: number;
    public readonly filledAmountQuote: number;

    constructor(item: any) {
        this.orderId = item.orderId;
        this.amount = +item.amount;
        this.amountRemaining = +item.amountRemaining;
        this.created = new Date(item.created);
        this.filledAmount = +item.filledAmount;
        this.filledAmountQuote = +item.filledAmountQuote;
    }
}