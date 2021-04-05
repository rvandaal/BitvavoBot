import { TickerPrice } from './ticker-price';
import { TickerPrice24h } from './ticker-price-24h';
import { Trade } from './trade';

export class Asset {
    private tradesInternal?: Trade[];
    private tickerPricesInternal: TickerPrice[];

    public readonly symbol: string; // should be uppercase
    public readonly name: string;
    public available: number;
    public inOrder: number;
    public investment: number;
    public euroPrice24hAgo: TickerPrice24h;

    constructor(symbol: string, name: string) {
        this.symbol = symbol;
        this.name = name;
        this.available = 0;
        this.inOrder = 0;
        this.investment = 0;
        this.tickerPricesInternal = [];
        this.euroPrice24hAgo = new TickerPrice24h(0, 0);
    }

    public get trades(): Trade[] | undefined {
        return this.tradesInternal;
    }

    public set trades(value: Trade[] | undefined) {
        this.tradesInternal = value;
        if (this.tradesInternal && this.tradesInternal.length) {
            this.investment = this.tradesInternal[0].totalEuroAmount;
        }
    }

    public get tickerPrices(): TickerPrice[] {
        return this.tickerPricesInternal;
    }

    public get currentPrice(): number {
        return this.tickerPrices.length ? this.tickerPrices[0].price : 0;
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
        return (this.currentPrice - this.euroPrice24hAgo.open) / this.euroPrice24hAgo.open * 100;
    }

    public get change1m(): number | undefined {
        let lastDate: Date;
        let date1minAgo: Date = new Date();
        let price1minAgo = 0;
        let first = true;
        // tslint:disable-next-line: prefer-const
        for (let tickerPrice of this.tickerPricesInternal) {
            if (first) {
                lastDate = tickerPrice.date;
                date1minAgo = new Date(lastDate.valueOf() - 60000);
                first = false;
            } else if (tickerPrice.date < date1minAgo) {
                price1minAgo = tickerPrice.price;
                break;
            }
        }
        if (price1minAgo > 0) {
            return (this.currentPrice - price1minAgo) / price1minAgo * 100;
        }
        return undefined;
    }

    public addNewPrice(tickerPrice: TickerPrice, baseCurrency: string): void {
        if (baseCurrency === 'EUR') {
            this.tickerPricesInternal.unshift(tickerPrice);
        }
    }
}
