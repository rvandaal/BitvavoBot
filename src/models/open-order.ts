import { OpenOrderResponse } from 'src/response-models/open-order-response';

export class OpenOrder {

    public symbol: string;

    constructor(private openOrderResponse: OpenOrderResponse) {
        const market = openOrderResponse.market;
        const index = market.indexOf('-');
        this.symbol = market.substr(0, index);
    }

    public get orderId(): string {
        return this.openOrderResponse.orderId;
    }

    public get orderType(): string {
        return this.openOrderResponse.orderType;
    }

    public get market(): string {
        return this.openOrderResponse.market;
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
