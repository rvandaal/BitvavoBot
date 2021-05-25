import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BitvavoService } from 'src/bitvavo.service';
import { loga, logr } from 'src/logr';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { Market } from 'src/models/market';
import { OpenOrder } from 'src/models/open-order';
import { TickerPrice } from 'src/models/ticker-price';
import { TickerPrice24h } from 'src/models/ticker-price-24h';
import { Trade } from 'src/models/trade';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';

export type AssetDictionary = Record<string, Asset>;


// This class is responsible for converting response models into domain models.
// It holds all relevant information that is not view specific and could be persisted.
// It contains the timer with which the current price is retrieved and exposes observables towards the views.

@Injectable({
    providedIn: 'root'
})
export class CoinService {
    private readonly smallestInterval = 1000;
    private intervalCounter = 0;
    private intervalId: NodeJS.Timeout | undefined;
    private assetsInternal: AssetDictionary;

    private notificationsSubject = new Subject<void>();
    private openOrderFilledSubject = new Subject<string>();

    public fee?: Fee;

    public isBalanceUpdated = true;
    public areTickerPricesUpdated = true;
    public areTickerPrices24hUpdated = true;

    public get assets(): AssetDictionary {
        return this.assetsInternal;
    }

    public get notifications$(): Observable<void> {
        return this.notificationsSubject.asObservable();
    }

    public get openOrderFilled$(): Observable<string> {
        return this.openOrderFilledSubject.asObservable();
    }

    constructor(private bitvavoService: BitvavoService) {
        this.assetsInternal = {};
    }

    public async start(): Promise<void> {
        await this.updateFees();
        await this.updateAssets();
        await this.updateBalance();
        this.intervalCounter = 0;
        this.intervalId = setInterval(() => {

            this.performPeriodicTasks();
        }, this.smallestInterval);
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    public placeBuyOrder(
        asset: Asset,
        tradeAmount: number,
        tradePrice: number | undefined,
        tradeTriggerPrice: number | undefined
    ): Promise<PlaceOrderResponse | undefined> {
        return this.bitvavoService.placeBuyOrder(
            asset.euroTradingPair,
            tradeAmount,
            tradePrice,
            tradeTriggerPrice,
            asset.decimals,
            asset.priceDecimals
        );
    }

    public placeSellOrder(
        asset: Asset,
        tradeAmount: number | undefined,
        tradePrice: number | undefined,
        tradeTriggerPrice: number | undefined
    ): Promise<PlaceOrderResponse | undefined> {
        if (tradeAmount === 0) {
            return Promise.reject();
        }
        if (!tradeAmount || tradeAmount > asset.available) {
            tradeAmount = asset.available; // sell all (that is not in order)
        }
        return this.bitvavoService.placeSellOrder(
            asset.euroTradingPair,
            tradeAmount,
            tradePrice,
            tradeTriggerPrice,
            asset.decimals,
            asset.priceDecimals
        );
    }

    public cancelOrder(asset: Asset, orderId: string): Promise<void> {
        return this.bitvavoService.cancelOrder(asset.euroMarket.marketName, orderId);
    }

    public async updateFees(): Promise<void> {
        const feeResponse = await this.bitvavoService.getFees();
        this.fee = new Fee(feeResponse);
    }

    public async updateTrades(asset: Asset): Promise<void> {
        const tradeResponses = await this.bitvavoService.getTrades(asset);
        //const list = tradeResponses.map(tradeResponse => new Trade(tradeResponse));
        //asset.trades = list; // this.groupTrades(list);

        if (!asset.trades) {
            return;
        }
        // We doen weer item voor item omdat trade nu state bevat die we willen behouden
        // Echter, om te kijken welke trades nog niet matchen met een open order, willen we
        // de hele lijst steeds opnieuw bekijken, niet alleen een nieuwe trade doorgeven.
        // Hij kan ook pas later gesettled worden.

        // tslint:disable-next-line: prefer-const
        for (let tradeResponse of tradeResponses) {
            const existingTrade = asset.trades.find(t => t.id === tradeResponse.id);
            if (!existingTrade) {
                const trade = new Trade(tradeResponse);
                asset.trades.push(trade);
                // notify bots, an open order can be matched with this trade
                // this.botOrdersInternal[trade.orderId].processFilledOrder(trade.orderId);
            }
        }
        const listToDelete: number[] = [];
        asset.trades.forEach((trade, index) => {
            const existingTradeResponse = tradeResponses.find(t => t.id === trade.id);
            if (!existingTradeResponse) {
                listToDelete.push(index);
            }
        });
        for (let j = listToDelete.length - 1; j >= 0; j--) {
            asset.trades.splice(listToDelete[j], 1);
        }
    }

    private performPeriodicTasks(): void {
        if (this.intervalCounter % 5 === 0) {
            this.performTasksWithInterval1s(); // todo: verplaatsen boven de 5 check
            this.performTasksWithInterval5s();
            this.intervalCounter = 0; // change if other tasks of >5s are added
        }
        this.intervalCounter++;
    }

    private async updateAssets(): Promise<void> {
        const assetResponses = await this.bitvavoService.getAssets();
        // tslint:disable-next-line: prefer-const
        for (let assetResponse of assetResponses) {
            this.assetsInternal[assetResponse.symbol] = new Asset(assetResponse.symbol, assetResponse.name, assetResponse.decimals);
        }
    }

    public async updateBalance(): Promise<void> {
        const balanceResponses = await this.bitvavoService.getBalance();
        // tslint:disable-next-line: prefer-const
        for (let balanceResponse of balanceResponses) {
            if (this.assetsInternal[balanceResponse.symbol]) {
                this.assetsInternal[balanceResponse.symbol].available = balanceResponse.available;
                this.assetsInternal[balanceResponse.symbol].inOrder = balanceResponse.inOrder;
            } else {
                console.log('asset bestaat niet: ', balanceResponse.symbol);
            }
        }
    }

    public async getCandles(asset: Asset, interval: string): Promise<CandleResponse[]> {
        return await this.bitvavoService.getCandles(asset.euroMarket.marketName, interval);
    }

    private async updateTickerPrices(): Promise<void> {
        const tickerPriceResponses = await this.bitvavoService.getTickerPrices();
        // tslint:disable-next-line: prefer-const
        for (let tickerPriceResponse of tickerPriceResponses) {
            const tickerPrice = new TickerPrice(tickerPriceResponse.price);
            const index = tickerPriceResponse.market.indexOf('-');
            const symbol = tickerPriceResponse.market.substr(0, index);
            const baseCurrency = tickerPriceResponse.market.substr(index + 1);
            if (this.assetsInternal[symbol]) {
                this.assets[symbol].addNewPrice(tickerPrice, baseCurrency);
            } else {
                console.log('updateTickerPrices, asset bestaat niet: ', symbol);
            }
        }
    }

    private async updateTickerPrices24h(): Promise<void> {
        const tickerPrice24hResponses = await this.bitvavoService.getTickerPrices24h();
        // tslint:disable-next-line: prefer-const
        for (let tickerPrice24hResponse of tickerPrice24hResponses) {
            const tickerPrice = new TickerPrice24h(tickerPrice24hResponse.open, tickerPrice24hResponse.last);
            const index = tickerPrice24hResponse.market.indexOf('-');
            const symbol = tickerPrice24hResponse.market.substr(0, index);
            this.assets[symbol].euroPrice24hAgo = tickerPrice;
        }
    }

    private async updateOpenOrders(): Promise<void> {
        const openOrderResponses = await this.bitvavoService.getOpenOrders();
        // tslint:disable-next-line: prefer-const
        for (let openOrderResponse of openOrderResponses) {
            const marketName = openOrderResponse.market;
            const market = new Market(marketName);
            const currency = market.currency;
            const asset = this.assetsInternal[currency];

            if (asset && market.baseCurrency === 'EUR') {
                const openOrders = asset.euroMarket.openOrders;
                const existingOpenOrder = openOrders.find(o => o.orderId === openOrderResponse.orderId);
                if (existingOpenOrder) {
                    existingOpenOrder.openOrderResponse = openOrderResponse;
                } else {
                    const openOrder = new OpenOrder(openOrderResponse, asset.euroMarket);
                    openOrders.push(openOrder);
                }
            } else {
                throw new Error('Asset that is referenced by open order does not exist');
            }
        }

        Object.keys(this.assetsInternal).forEach(key => {
            const asset = this.assets[key];
            const openOrders = asset.euroMarket.openOrders; // normaal gesproken heeft model link naar responsemodel, hier niet..?!
            // tslint:disable-next-line: prefer-const
            const listToDelete: number[] = [];
            let first = true;
            // tslint:disable-next-line: prefer-const
            openOrders.forEach(async (openOrder, index) => {
                const openOrderResponse = openOrderResponses.find(o => o.orderId === openOrder.orderId);
                if (!openOrderResponse) {
                    if (first) {
                        await this.updateTrades(asset); // needed only once per asset
                        first = false;
                    }
                    this.openOrderFilledSubject.next(openOrder.orderId);
                    listToDelete.push(index);
                }
            });
            for (let j = listToDelete.length - 1; j >= 0; j--) {
                openOrders.splice(listToDelete[j], 1);
            }
        });
    }

    private performAnalysis(): void {
        Object.keys(this.assets).forEach(key => {
            const asset = this.assets[key];
            asset.update();
        });
    }

    private async performTasksWithInterval1s(): Promise<void> {
        await this.updateOpenOrders();
        // this.activeBots.forEach(async b => {
        //     logr('Check trades for bot: ' + b.asset.symbol);
        //     await this.updateTrades(b.asset);
        //     b.asset.trades?.forEach(t => {
        //         if (!t.isMatchedWithOpenOrder) {
        //             console.log('Trade that is not yet matched against open order: ', t);
        //             if (t.settled) {
        //                 console.log('Found settled trade that is not yet matched against open order: ', t);
        //                 if (b.processFilledOrder(t.orderId)) {
        //                     t.isMatchedWithOpenOrder = true;
        //                 }
        //             }
        //         }
        //     });
        // });
    }

    private async performTasksWithInterval5s(): Promise<void> {
        if (this.isBalanceUpdated) {
            this.logLimit();
            console.log('updateBalance');
            await this.updateBalance();
            this.logLimit();
            console.log('');
        }

        if (this.areTickerPricesUpdated) {
            this.logLimit();
            console.log('updateTickerPrices');
            await this.updateTickerPrices();
            this.logLimit();
            console.log('');
        }

        if (this.areTickerPrices24hUpdated) {
            this.logLimit();
            console.log('updateTickerPrices24h');
            await this.updateTickerPrices24h();
            this.logLimit();
            console.log('');
        }
        this.performAnalysis();
        this.notificationsSubject.next();
    }

    private logLimit(): void {
        this.bitvavoService.logLimit();
    }

    // private groupTrades(trades: Trade[]): Trade[] {
    //     const groupedList: Trade[] = [];
    //     let currentDate: Date | undefined;
    //     let currentPrice: number | undefined;
    //     let currentIsBuy: boolean | undefined;
    //     let groupedTrade: Trade | undefined;

    //     // tslint:disable-next-line: prefer-const
    //     for (let item of trades) {
    //         const date = item.date;
    //         if (
    //             !currentDate || Math.abs(date.getTime() - currentDate?.getTime()) > 1000 ||
    //             currentPrice !== item.price ||
    //             currentIsBuy !== item.isBuy
    //         ) {
    //             if (groupedTrade) {
    //                 groupedList.push(groupedTrade);
    //             }
    //             const euroAmount = item.isBuy ?
    //                 (item.amount * item.price + item.fee) :
    //                 ((item.amount * item.price - item.fee));
    //             groupedTrade =
    //                 new Trade(item.market, item.amount, item.price, item.isBuy, date, item.fee);
    //             groupedTrade.euroAmount = euroAmount;
    //             currentDate = date;
    //             currentPrice = item.price;
    //             currentIsBuy = item.isBuy;
    //         } else if (groupedTrade) {
    //             groupedTrade.amount += item.amount;
    //             groupedTrade.euroAmount += item.isBuy ?
    //                 (item.amount * item.price + item.fee) :
    //                 (item.amount * item.price - item.fee);
    //             groupedTrade.fee += item.fee;
    //         }
    //     }
    //     if(groupedTrade) {
    //         groupedList.push(groupedTrade);
    //     }
    //     // Compute totals
    //     for (let i = groupedList.length - 1; i >= 0; i--) {
    //         const item = groupedList[i];
    //         let previousTotal = 0;
    //         let previousTotalEuro = 0;
    //         if (i < groupedList.length - 1) {
    //             previousTotal = groupedList[i + 1].totalAmount;
    //             previousTotalEuro = groupedList[i + 1].totalEuroAmount;
    //         }
    //         item.totalAmount = previousTotal + (item.isBuy ? item.amount : -item.amount);
    //         item.totalEuroAmount = previousTotalEuro + (item.isBuy ? item.euroAmount : -item.euroAmount);
    //     }

    //     return groupedList;
    // }
}
