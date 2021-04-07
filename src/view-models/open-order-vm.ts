import { OpenOrder } from 'src/models/open-order';

export class OpenOrderVm {
    constructor(public openOrder: OpenOrder) {
        
    }

    public get orderId(): string {
        return this.openOrder.orderId;
    }

    public get orderType(): string {
        return this.openOrder.orderType;
    }

    public get symbol(): string {
        return this.openOrder.symbol;
    }

    public get market(): string {
        return this.openOrder.market;
    }

    public get isBuy(): boolean {
        return this.openOrder.isBuy;
    }

    public get amount(): number {
        return this.openOrder.amount;
    }

    public get amountRemaining(): number {
        return this.openOrder.amountRemaining;
    }

    public get filledAmount(): number {
        return this.openOrder.filledAmount;
    }
}