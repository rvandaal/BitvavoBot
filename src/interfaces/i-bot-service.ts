import { Observable } from 'rxjs';
import { Asset } from 'src/models/asset';
import { Fee } from 'src/models/fee';
import { CandleResponse } from 'src/response-models/candle-response';
import { PlaceOrderResponse } from 'src/response-models/place-order-response';

export interface IBotService {

    currentPrice: number;
    fee: Fee | undefined;

    updateBalance(): Promise<void>;

    registerForCandles(asset: Asset, intervalInSeconds: number, candleInterval: string): Observable<CandleResponse[]>;

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
