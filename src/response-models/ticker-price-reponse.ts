export class TickerPriceResponse {

    public readonly market: string;
    public readonly price: number;

    constructor(item: any) {
        this.market = item.market;
        this.price = +item.price;
    }
}