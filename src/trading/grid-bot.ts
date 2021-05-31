import { IBotService } from 'src/interfaces/i-bot-service';
import { loga } from 'src/logr';
import { Trade } from 'src/models/trade';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { Bot } from './bot';
import { IGridConfig } from './i-grid-config';

export class GridBot extends Bot {

    private gridLines: number[] = [];
    private currentHiddenGridLine = 0;
    private minBoundary = 0;
    private maxBoundary = 0;

    private placeOrderResponses: PlaceOrderResponse[] = [];

    public tradeAmountInAltPerGridLine = 0;

    public gridLineDistance = 0;

    constructor(private config: IGridConfig, botService: IBotService) {
        super(config.asset, botService);
    }

    public get numberOfGridLines(): number {
        return this.config.numberOfGridLines;
    }

    public get totalInvestmentInEuro(): number {
        return this.config.totalInvestmentInEuro;
    }

    @loga()
    public async start(): Promise<void> {
        await super.start();

        this.currentValueInAlt = 0;
        this.currentCashInEuro = this.config.totalInvestmentInEuro;

        this.minBoundary = this.config.minBoundary ?? 0;
        this.maxBoundary = this.config.maxBoundary ?? 0;
        const halfRange = this.config.halfRange;

        if (
            this.config.numberOfGridLines < 2 || this.config.numberOfGridLines % 2 === 0 ||
            this.config.minBoundary && this.config.minBoundary <= 0
        ) {
            return;
        }
        const currentPrice = this.currentPrice;

        if (this.config.useHalfRange && halfRange) {
            // ignore min and max boundaries from config
            this.minBoundary = Math.max(currentPrice - halfRange, 0.0001);
            // todo: checken: als de prijs heel hoog is, kan het zijn dat je insufficient balance krijgt
            this.maxBoundary = currentPrice + halfRange;
        }
        if (this.minBoundary === 0 || this.maxBoundary === 0) {
            return;
        }

        //
        // Define range and gridlines. The grid line that is closest to the current position is not implemented (=order is placed)
        // until another gridline is touched.
        // But, the current position is included in the numberOfGridLines. So, with 3 gridlines, you have min, max and current position.
        // Min and max are immediately placed, the gridline closest to the current position not.
        const range = this.maxBoundary - this.minBoundary;
        this.gridLineDistance = range / (this.config.numberOfGridLines - 1);

        this.currentHiddenGridLine = this.getGridLineClosestToCurrentPrice();

        // totale initiele kosten in euros: initialAmountAlt * initialPrice * (1 + fee)

        // initial investment. If all sell orders are filled, no buy orders, we should have 0 euro.
        this.estimatedInitialInvestmentInEuro = this.config.totalInvestmentInEuro / 2;

        await super.placeInitialBuyOrder();

        this.tradeAmountInAltPerGridLine = this.initialInvestmentInAlt / ((this.config.numberOfGridLines - 1) / 2);

        // grid lines are now known; place orders
        await this.placeInitialOrders();
    }

    public async stop(): Promise<void> {
        // Cancel all open orders
        await Promise.all(this.placeOrderResponses.map(p => {
            if (p.orderId) {
                return this.botService.cancelOrder(this.asset, p.orderId);
            }
            return Promise.resolve();
        }));

        // Sell initial investment
        await super.stop();
    }

    @loga()
    public async processFilledOrder(orderId: string, trades: Trade[]): Promise<boolean> {
        if (!trades || !trades.length) {
            console.log('order was cancelled');
            const placeOrderResponse2 = this.placeOrderResponses.find(p => p.orderId === orderId);
            if (placeOrderResponse2) {
                const index2 = this.placeOrderResponses.indexOf(placeOrderResponse2);
                this.placeOrderResponses.splice(index2, 1);
                console.log('Return true, order was cancelled');
                return true;
            }
            console.log('Return false, no order found');
            return false;
        }
        // order is completely filled
        const placeOrderResponse = this.placeOrderResponses.find(p => p.orderId === orderId);
        if (!placeOrderResponse) {
            // logr('No placed order found');
            console.log('Return false, no order found');
            return false;
        }

        // console.log('Order filled, trades: ', trades);
        // 1 eth * 3500 gekocht = +1 eth en -3500 - fee   - ik moet meer betalen
        // 1 eth * 3500 euro verkocht = -1 eth en 3500 - fee - ik krijg minder terug

        let totalFilledInEuros = 0;
        let totalAmount = 0;
        // tslint:disable-next-line: prefer-const
        for (let trade of trades) {
            totalAmount += trade.amount;
            totalFilledInEuros += trade.amount * trade.price - trade.fee;
            this.feePaid += trade.fee;
        }

        if (trades[0].isBuy) {
            // console.log(
            //     'order filled below current position, order price: ' + trades[0].price
            // );
            // we just bought some altcoins, no create a new grid line. The current gridline is already removed by filling the order.
            this.numberOfBuyOrdersFilled++;
            this.currentValueInAlt += totalAmount;
            this.currentCashInEuro -= totalFilledInEuros;
            this.updateBotProfit(0);
            await this.placeSellOrder(this.tradeAmountInAltPerGridLine, trades[0].price + this.gridLineDistance);
        } else {
            // console.log(
            //     'order filled above current position, order price: ' + trades[0].price
            // );
            // A sell order is filled, update the bot profit
            this.numberOfSellOrdersFilled++;
            this.currentValueInAlt -= totalAmount;
            this.currentCashInEuro += totalFilledInEuros;
            this.updateBotProfit(0);
            await this.placeBuyOrder(this.tradeAmountInAltPerGridLine, trades[0].price - this.gridLineDistance);
        }
        // this.currentHiddenGridLine = placeOrderResponse.fills[0].price;
        // note: splice changes original array
        const index = this.placeOrderResponses.indexOf(placeOrderResponse);
        this.placeOrderResponses.splice(index, 1);

        //console.log('Return true');
        return true;

    }

    private async updateBotProfit(deltaProfit: number): Promise<void> {
        console.log(
            'bot winst: ', this.profitFromBot, ', winst zonder bot: ',
            this.profitWithoutBot, ', winst met bot: ', this.profitWithBot
        );

        console.log(
            'NumberOfBuys: ', this.numberOfBuyOrdersFilled, ', numberOfSells: ', this.numberOfSellOrdersFilled,
            ', amount of alt: ', this.currentValueInAlt, ', cash: ', this.currentCashInEuro
        );
    }

    private getGridLineClosestToCurrentPrice(): number {
        if (!this.minBoundary || !this.maxBoundary) {
            return 0;
        }
        let closestGridLine = 0;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (let gridLinePrice = this.minBoundary; gridLinePrice <= this.maxBoundary * 1.00001; gridLinePrice += this.gridLineDistance) {
            this.gridLines.push(gridLinePrice);
            const distance = Math.abs(gridLinePrice - this.currentPrice);
            if (distance < minDistance) {
                closestGridLine = gridLinePrice;
                minDistance = distance;
            }
        }
        return closestGridLine;
    }

    private async placeInitialOrders(): Promise<void> {
        console.log('---------------------------------------------------');
        console.log('Place initial orders');
        // tslint:disable-next-line: prefer-const
        for (const price of this.gridLines) {
            if (price < this.currentHiddenGridLine - this.gridLineDistance / 10) {
                await this.placeBuyOrder(this.tradeAmountInAltPerGridLine, price);
            } else if (price > this.currentHiddenGridLine + this.gridLineDistance / 10) {
                await this.placeSellOrder(this.tradeAmountInAltPerGridLine, price);
            }
        }
    }

    private async placeBuyOrder(amount: number, price: number): Promise<void> {
        console.log('place buy order, amount: ' + amount + ', price: ' + price);
        const response = await this.botService.placeBuyOrder(this.asset, amount, price);
        if (response) {
            this.placeOrderResponses.push(response);
        }
    }

    private async placeSellOrder(amount: number, price: number): Promise<void> {
        console.log('place sell order, amount: ' + amount + ', price: ' + price);
        const response = await this.botService.placeSellOrder(this.asset, amount, price);
        if (response) {
            this.placeOrderResponses.push(response);
        }
    }
}
