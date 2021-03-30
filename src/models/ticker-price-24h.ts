export class TickerPrice24h {

    public readonly market: string;
    public readonly open: number;
    public readonly last: number;

    constructor(item: any) {
        this.market = item.market;
        this.open = +item.open;
        this.last = +item.last;
    }
}