import { TradeResponse } from 'src/response-models/trade-response';

export class Trade {
    public totalAmount: number;
    public euroAmount: number;
    public totalEuroAmount: number;
    public isMatchedWithOpenOrder = false; // not existing in tradeResponse, so extra state

    constructor(private tradeResponse: TradeResponse) {
        this.totalAmount = 0;
        this.euroAmount = 0;
        this.totalEuroAmount = 0;
    }

    public get id(): string {
        return this.tradeResponse.id;
    }

    public get orderId(): string {
        return this.tradeResponse.orderId;
    }

    public get market(): string {
        return this.tradeResponse.market;
    }

    public get amount(): number {
        return this.tradeResponse.amount;
    }

    public get price(): number {
        return this.tradeResponse.price;
    }

    public get isBuy(): boolean {
        return this.tradeResponse.isBuy;
    }

    public get date(): Date {
        return this.tradeResponse.date;
    }

    public get fee(): number {
        return this.tradeResponse.fee;
    }

    public get settled(): boolean {
        // is true when the fee is deducted and the bought/sold currency is available for further trading.
        // Fills are settled almost instantly.
        return this.tradeResponse.settled;
    }
}