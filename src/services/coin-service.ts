import { stringify } from '@angular/compiler/src/util';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BitvavoService } from 'src/bitvavo.service';
import { Asset } from 'src/models/asset';
import { Market } from 'src/models/market';
import { OpenOrder } from 'src/models/open-order';
import { TickerPrice } from 'src/models/ticker-price';
import { TickerPrice24h } from 'src/models/ticker-price-24h';
import { Trade } from 'src/models/trade';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { CoinBot } from 'src/trading/coin-bot';
import { GridCoinBot } from 'src/trading/grid-coin-bot';
import { IGridConfig } from 'src/trading/i-grid-config';

// This class is responsible for converting response models into domain models.
// It holds all relevant information that is not view specific and could be persisted.
// It contains the timer with which the current price is retrieved and exposes observables towards the views.


export type AssetDictionary = Record<string, Asset>;
export type BotOrderDictionary = Record<string, CoinBot>;


@Injectable({
    providedIn: 'root'
})
export class CoinService {
    private readonly smallestInterval = 1000;
    private intervalCounter = 0;
    private intervalId: NodeJS.Timeout | undefined;
    private assetsInternal: AssetDictionary;
    private botOrdersInternal: BotOrderDictionary;

    private notificationsSubject = new Subject<void>();

    public get assets(): AssetDictionary {
        return this.assetsInternal;
    }

    public get notifications$(): Observable<void> {
        return this.notificationsSubject.asObservable();
    }

    constructor(private bitvavoService: BitvavoService) {
        this.assetsInternal = {};
        this.botOrdersInternal = {};
    }

    public start(): void {
        (async () => {
            await this.updateAssets();
            await this.updateBalance();
            this.intervalCounter = 0;
            this.intervalId = setInterval(() => {
                this.performPeriodicTasks();
            }, this.smallestInterval);
        })();
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
    ): Promise<PlaceOrderResponse> {
        const result = this.bitvavoService.placeBuyOrder(asset.euroTradingPair, tradeAmount, tradePrice, tradeTriggerPrice);
        console.log(result);
        return result;
    }

    public placeSellOrder(
        asset: Asset,
        tradeAmount: number | undefined,
        tradePrice: number | undefined,
        tradeTriggerPrice: number | undefined
    ): Promise<PlaceOrderResponse> {
        if (!tradeAmount) {
            tradeAmount = asset.available;
        }
        return this.bitvavoService.placeSellOrder(asset.euroTradingPair, tradeAmount, tradePrice, tradeTriggerPrice);
    }

    public async updateTrade(asset: Asset): Promise<void> {
        const tradeResponses = await this.bitvavoService.getTrades(asset);
        const list = tradeResponses.map(
            tradeResponse =>
                new Trade(
                    tradeResponse.market,
                    tradeResponse.amount,
                    tradeResponse.price,
                    tradeResponse.isBuy,
                    tradeResponse.date,
                    tradeResponse.fee
                )
            );
        asset.trades = this.groupTrades(list);
    }

    public registerBotForOpenOrder(orderId: string, bot: CoinBot): void { // called by bot
        this.botOrdersInternal[orderId] = bot;
    }

    private performPeriodicTasks(): void {
        if (this.intervalCounter % 5 === 0) {
            this.performTasksWithInterval5s();
            this.intervalCounter = 0; // change if other tasks of >5s are added
        }
        this.intervalCounter++;
    }

    private async updateAssets(): Promise<void> {
        const assetResponses = await this.bitvavoService.getAssets();
        // tslint:disable-next-line: prefer-const
        for (let assetResponse of assetResponses) {
            this.assetsInternal[assetResponse.symbol] = new Asset(assetResponse.symbol, assetResponse.name);
        }
    }

    private async updateBalance(): Promise<void> {
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
            const openOrders = asset.euroMarket.openOrders;
            // tslint:disable-next-line: prefer-const
            const listToDelete: number[] = [];
            // tslint:disable-next-line: prefer-const
            openOrders.forEach((openOrder, index) => {
                const openOrderResponse = openOrderResponses.find(o => o.orderId === openOrder.orderId);
                if (!openOrderResponse) {
                    const bot = this.botOrdersInternal[openOrder.orderId];
                    if (bot) {
                        // Order is filled and there is a bot waiting for it.
                        bot.processFilledOrder(openOrder.orderId);
                        delete this.botOrdersInternal[openOrder.orderId];
                    }
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

    private async performTasksWithInterval5s(): Promise<void> {
        await this.updateBalance();
        await this.updateTickerPrices();
        await this.updateTickerPrices24h();
        await this.updateOpenOrders();
        this.performAnalysis();
        this.notificationsSubject.next();
    }

    private groupTrades(trades: Trade[]): Trade[] {
        const groupedList: Trade[] = [];
        let currentDate: Date | undefined;
        let currentPrice: number | undefined;
        let currentIsBuy: boolean | undefined;
        let groupedTrade: Trade | undefined;

        // tslint:disable-next-line: prefer-const
        for (let item of trades) {
            const date = item.date;
            if (
                !currentDate || Math.abs(date.getTime() - currentDate?.getTime()) > 1000 ||
                currentPrice !== item.price ||
                currentIsBuy !== item.isBuy
            ) {
                if (groupedTrade) {
                    groupedList.push(groupedTrade);
                }
                const euroAmount = item.isBuy ?
                    (item.amount * item.price + item.fee) :
                    ((item.amount * item.price - item.fee));
                groupedTrade =
                    new Trade(item.market, item.amount, item.price, item.isBuy, date, item.fee);
                groupedTrade.euroAmount = euroAmount;
                currentDate = date;
                currentPrice = item.price;
                currentIsBuy = item.isBuy;
            } else if (groupedTrade) {
                groupedTrade.amount += item.amount;
                groupedTrade.euroAmount += item.isBuy ?
                    (item.amount * item.price + item.fee) :
                    (item.amount * item.price - item.fee);
                groupedTrade.fee += item.fee;
            }
        }
        if(groupedTrade) {
            groupedList.push(groupedTrade);
        }
        // Compute totals
        for (let i = groupedList.length - 1; i >= 0; i--) {
            const item = groupedList[i];
            let previousTotal = 0;
            let previousTotalEuro = 0;
            if (i < groupedList.length - 1) {
                previousTotal = groupedList[i + 1].totalAmount;
                previousTotalEuro = groupedList[i + 1].totalEuroAmount;
            }
            item.totalAmount = previousTotal + (item.isBuy ? item.amount : -item.amount);
            item.totalEuroAmount = previousTotalEuro + (item.isBuy ? item.euroAmount : -item.euroAmount);
        }

        return groupedList;
    }
}