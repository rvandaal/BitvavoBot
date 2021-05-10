import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { CoinService } from 'src/services/coin-service';
import { CoinBot } from './coin-bot';
import { IGridConfig } from './i-grid-config';

export class GridCoinBot extends CoinBot {
    private isActive = false;
    private gridLines: number[] = [];
    private currentHiddenGridLine = 0;
    private tradeAmountInAltPerGridLine = 0.0002; // ~10 euro btc for now

    private placeOrderResponses: PlaceOrderResponse[] = [];

    constructor(private config: IGridConfig, private coinService: CoinService) {
        super();
    }

    public async start(): Promise<void> {
        if (this.isActive) {
            return;
        }
        this.isActive = true;

        let minBoundary: number | undefined = this.config.minBoundary;
        let maxBoundary: number | undefined = this.config.maxBoundary;
        const halfRange = this.config.halfRange;

        if (this.config.numberOfGridLines < 2 || this.config.minBoundary && this.config.minBoundary <= 0) {
            return;
        }
        const currentPrice = this.config.asset.currentPrice;
        if (halfRange) {
            // ignore min and max boundaries
            minBoundary = currentPrice - halfRange;
            maxBoundary = currentPrice + halfRange;
        }
        if (!minBoundary || !maxBoundary) {
            return;
        }

        //
        // Define range and gridlines. The grid line that is closest to the current position is not implemented (=order is placed)
        // until another gridline is touched.
        // But, the current position is included in the numberOfGridLines. So, with 3 gridlines, you have min, max and current position.
        // Min and max are immediately placed, the gridline closest to the current position not.
        const range = maxBoundary - minBoundary;
        const gridLineDistance = range / (this.config.numberOfGridLines - 1);
        let closestGridLine = 0;
        let minDistance = Number.MAX_SAFE_INTEGER;

        for (let gridLinePrice = minBoundary; gridLinePrice <= maxBoundary; gridLinePrice += gridLineDistance) {
            this.gridLines.push(gridLinePrice);
            const distance = Math.abs(gridLinePrice - currentPrice);
            if (distance < minDistance) {
                closestGridLine = gridLinePrice;
                minDistance = distance;
            }
        }
        this.currentHiddenGridLine = closestGridLine;

        // grid lines are now known; place orders

        // tslint:disable-next-line: prefer-const
        for (let price of this.gridLines) {
            if (price < this.currentHiddenGridLine - gridLineDistance / 10) {
                await this.placeBuyOrder(this.tradeAmountInAltPerGridLine, price);
            } else if (price > this.currentHiddenGridLine + gridLineDistance / 10) {
                await this.placeSellOrder(this.tradeAmountInAltPerGridLine, price);
            }
        }
    }

    public processFilledOrder(orderId: string): void {
        const placeOrderResponse = this.placeOrderResponses.find(p => p.orderId === orderId);
        if (!placeOrderResponse) {
            // should not happen
            throw new Error('Bot is waiting for filled order but there is no corresponding placeOrderResponse');
        }
        console.log('order filled: ', placeOrderResponse);

        if (placeOrderResponse.price < this.currentHiddenGridLine) {
            // we just bought some altcoins, no create a new grid line. The current gridline is already removed by filling the order.
            this.placeSellOrder(this.tradeAmountInAltPerGridLine, this.currentHiddenGridLine);
        } else {
            this.placeBuyOrder(this.tradeAmountInAltPerGridLine, this.currentHiddenGridLine);
        }
        this.currentHiddenGridLine = placeOrderResponse.price;
        // note: splice changes original array
        const index = this.placeOrderResponses.indexOf(placeOrderResponse);
        this.placeOrderResponses.splice(index, 1);

    }

    private async placeBuyOrder(amount: number, price: number): Promise<void> {
        const response = await this.coinService.placeBuyOrder(this.config.asset, amount, price, undefined);
        this.placeOrderResponses.push(response);
        this.coinService.registerBotForOpenOrder(response.orderId, this);
    }

    private async placeSellOrder(amount: number, price: number): Promise<void> {
        const response = await this.coinService.placeSellOrder(this.config.asset, amount, price, undefined);
        this.placeOrderResponses.push(response);
        this.coinService.registerBotForOpenOrder(response.orderId, this);
    }
}