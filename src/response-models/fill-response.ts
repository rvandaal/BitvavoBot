export class FillResponse {
    public readonly price: number;
    public readonly amount: number;
    public readonly fee: number;
    public readonly date: Date;

    public get buyFillCostInEuro(): number {
        return this.amount * this.price + this.fee;
    }

    public get sellFillGainInEuro(): number {
        return this.amount * this.price - this.fee;
    }

    constructor(item: any) {
        this.price = +item.price;
        this.amount = +item.amount;
        this.fee = +item.fee;
        this.date = new Date(item.timestamp);
    }
}
