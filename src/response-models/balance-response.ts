export class BalanceResponse {
    public readonly symbol: string;
    public readonly available: number;
    public readonly inOrder: number;

    constructor(item: any) {
        this.symbol = item.symbol.toUpperCase();
        this.available = +item.available;
        this.inOrder = +item.inOrder;
    }
}