import { Asset } from 'src/models/asset';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';
import { CoinService } from 'src/services/coin-service';
import { Bot } from 'src/trading/bot';

export interface IBotService {

    bot: Bot | undefined;
    currentPrice: number;

    updateBalance(): Promise<void>;

    cancelOrder(asset: Asset, orderId: string): Promise<void>;

    placeBuyOrder(
        asset: Asset,
        tradeAmount: number,
        tradePrice: number | undefined
    ): Promise<PlaceOrderResponse | undefined>;

    placeSellOrder(
        asset: Asset,
        tradeAmount: number | undefined,
        tradePrice: number | undefined
    ): Promise<PlaceOrderResponse | undefined>;
}
