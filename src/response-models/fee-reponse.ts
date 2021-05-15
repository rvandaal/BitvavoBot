export class FeeResponse {
    public maker: number;
    public taker: number;

    constructor(item: any) {
        this.maker = +item.fees.maker;
        this.taker = +item.fees.taker;
    }
}
