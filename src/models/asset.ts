import { textChangeRangeIsUnchanged } from 'typescript';
import { Market } from './market';
import { TickerPrice } from './ticker-price';
import { TickerPrice24h } from './ticker-price-24h';
import { Trade } from './trade';

export class Asset {
    private tradesInternal: Trade[] = [];
    private tickerPricesInternal: TickerPrice[];

    public readonly symbol: string; // should be uppercase
    public readonly name: string;
    public readonly decimals: number;
    public available: number;
    public inOrder: number;
    public investment: number;
    public euroPrice24hAgo: TickerPrice24h;
    public change1m: number | undefined;
    public minPrice: number;
    public maxPrice: number;
    public numberOfSubsequentIncreasements: number;
    public euroMarket: Market;

    constructor(symbol: string, name: string, decimals: number) {
        this.symbol = symbol;
        this.name = name;
        this.decimals = decimals;
        this.available = 0;
        this.inOrder = 0;
        this.investment = 0;
        this.tickerPricesInternal = [];
        this.euroPrice24hAgo = new TickerPrice24h(0, 0);
        this.minPrice = 0;
        this.maxPrice = 0;
        this.numberOfSubsequentIncreasements = 0;
        this.euroMarket = new Market(symbol + '-EUR');
    }

    public get priceDecimals(): number {
        switch (this.symbol) {
            case 'ADA':
                return 4;
        }
        return 4;
    }

    public get trades(): Trade[] {
        return this.tradesInternal;
    }

    // public set trades(value: Trade[] | undefined) {
    //     this.tradesInternal = value;
    //     if (this.tradesInternal && this.tradesInternal.length) {
    //         this.investment = this.tradesInternal[0].totalEuroAmount;
    //     }
    // }

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

    public get currentValueInEuro(): number {
        return this.totalAmount * this.currentPrice;
    }

    public get change24h(): number {
        return (this.currentPrice - this.euroPrice24hAgo.open) / this.euroPrice24hAgo.open * 100;
    }

    public get relativeChange(): number | undefined {
        if (this.maxPrice - this.minPrice === 0) {
            return undefined;
        }
        return (this.currentPrice - this.minPrice) / (this.maxPrice - this.minPrice);
    }

    public addNewPrice(tickerPrice: TickerPrice, baseCurrency: string): void {
        if (baseCurrency === 'EUR') {
            this.tickerPricesInternal.unshift(tickerPrice);
        }
    }

    public update(): void {
        this.updateChange1m();
        if (this.tickerPricesInternal.length){
            this.minPrice = Math.min(...this.tickerPricesInternal.slice(20).map(p => p.price));
            this.maxPrice = Math.max(...this.tickerPricesInternal.slice(20).map(p => p.price));
        }
        this.updateNumberOfSubsequentIncreasements();
    }

    private updateChange1m(): void {
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
            this.change1m = (this.currentPrice - price1minAgo) / price1minAgo * 100;
        }
        this.change1m = undefined;
    }

    private updateNumberOfSubsequentIncreasements(): void {
        let first = true;
        let currentPrice = 0;
        let counter = 0;
        // tslint:disable-next-line: prefer-const
        for (let tickerPrice of this.tickerPricesInternal) {
            if (first) {
                currentPrice = tickerPrice.price;
                first = false;
            } else if (tickerPrice.price < currentPrice) {
                counter++;
                currentPrice = tickerPrice.price;
            } else {
                this.numberOfSubsequentIncreasements = counter;
                break;
            }
        }
    }
}
