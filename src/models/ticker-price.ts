export class TickerPrice {
    public readonly date: Date;

    constructor(public price: number) {
        this.date = new Date();
    }
}