import { OpenOrderResponse } from 'src/response-models/open-order-response';
import { Market } from './market';

export class OpenOrder {

    public market: Market;

    constructor(public openOrderResponse: OpenOrderResponse, market: Market) {
        this.market = market;
    }

    public get orderId(): string {
        return this.openOrderResponse.orderId;
    }

    public get orderType(): string {
        return this.openOrderResponse.orderType;
    }

    public get isBuy(): boolean {
        return this.openOrderResponse.isBuy;
    }

    public get amount(): number {
        return this.openOrderResponse.amount;
    }

    public get amountRemaining(): number {
        return this.openOrderResponse.amountRemaining;
    }

    public get filledAmount(): number {
        return this.openOrderResponse.filledAmount;
    }
}
