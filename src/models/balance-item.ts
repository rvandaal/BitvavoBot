export class BalanceItem {
    public readonly symbol: string;
    public readonly available: number;
    public readonly inOrder: number;

    constructor(item: any) {
        this.symbol = item.symbol;
        this.available = +item.available;
        this.inOrder = +item.inOrder;
    }

    public get totalAmount(): number {
        return this.available + this.inOrder;
    }
}