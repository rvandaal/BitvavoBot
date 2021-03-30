import { Trades } from './trades';

export class Asset {
    private _tradingHistory?: Trades;

    public readonly symbol: string; // should be uppercase
    public readonly name: string;
    public available: number;
    public inOrder: number;
    public investment: number;
    public currentPrice: number;
    public price24hAgo: number;

    constructor(item: any) {
        this.symbol = item.symbol.toUpperCase();
        this.name = item.name;
        this.available = 0;
        this.inOrder = 0;
        this.investment = 0;
        this.currentPrice = 0;
        this.price24hAgo = 0;
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
        return this.symbol + '-EUR';
    }

    public get totalAmount(): number {
        return this.available + this.inOrder;
    }

    public get currentValue(): number {
        return this.totalAmount * this.currentPrice;
    }

    public get change24h(): number {
        return (this.currentPrice - this.price24hAgo) / this.price24hAgo * 100;
    }
}