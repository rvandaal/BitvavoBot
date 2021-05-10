export class PlaceOrderResponse {
    public readonly orderId: string;
    public readonly orderType: 'limit' | 'market';
    public readonly price: number;
    public readonly amount: number;
    public readonly amountRemaining: number;
    public readonly created: Date;
    public readonly filledAmount: number;
    public readonly filledAmountQuote: number;

    constructor(item: any) {
        this.orderId = item.orderId;
        this.orderType = item.orderType;
        this.price = +item.price;
        this.amount = +item.amount;
        this.amountRemaining = +item.amountRemaining;
        this.created = new Date(item.created);
        this.filledAmount = +item.filledAmount;
        this.filledAmountQuote = +item.filledAmountQuote;
    }
}