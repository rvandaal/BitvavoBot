import { Trades } from './trades';

export class Asset {
    private _tradingHistory?: Trades;

    public readonly symbol: string;
    public readonly name: string;
    public available: number;
    public inOrder: number;
    public investment: number;
    public currentPrice: number;

    constructor(item: any) {
        this.symbol = item.symbol;
        this.name = item.name;
        this.available = 0;
        this.inOrder = 0;
        this.investment = 0;
        this.currentPrice = 0;
    }

    public get trades(): Trades | undefined {
        return this._tradingHistory;
    }

    public set trades(value: Trades | undefined) {
        this._tradingHistory = value;
        if (this._tradingHistory) {
            this.investment = this._tradingHistory.groupedList[0].totalEuroAmount;
        }
    }

    public get euroTradingPair(): string {
        return this.symbol.toUpperCase() + '-EUR';
    }

    public get totalAmount(): number {
        return this.available + this.inOrder;
    }

    public get currentValue(): number {
        return this.totalAmount * this.currentPrice;
    }
}