import { TradeHistory } from './trade-history';

export class Asset {
    private _tradingHistory?: TradeHistory;

    public readonly symbol: string;
    public readonly name: string;
    public available: number;
    public inOrder: number;
    public investment: number;

    constructor(item: any) {
        this.symbol = item.symbol;
        this.name = item.name;
        this.available = 0;
        this.inOrder = 0;
        this.investment = 0;
    }

    public get tradeHistory(): TradeHistory | undefined {
        return this._tradingHistory;
    }

    public set tradeHistory(value: TradeHistory | undefined) {
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
}