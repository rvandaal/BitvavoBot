export class FillResponse {
    public readonly price: number;
    public readonly amount: number;
    public readonly fee: number;
    public readonly date: Date;

    constructor(item: any) {
        this.price = +item.price;
        this.amount = +item.amount;
        this.fee = +item.fee;
        this.date = new Date(item.timestamp);
    }
}