import { FillResponse } from './fill-response';

export class PlaceOrderResponse {
    public readonly orderId: string | undefined;
    public readonly orderType: 'limit' | 'market';
    public readonly fills: FillResponse[];
    public readonly amountRemaining?: number;
    public readonly created?: Date;
    public readonly filledAmount?: number;
    public readonly filledAmountQuote?: number;

    constructor(item: any) {
        this.orderId = item.orderId;
        this.orderType = item.orderType;
        this.fills = item.fills.map(f => new FillResponse(f));
        this.amountRemaining = +item.amountRemaining;
        this.created = new Date(item.created);
        this.filledAmount = +item.filledAmount;
        this.filledAmountQuote = +item.filledAmountQuote;
    }
}
