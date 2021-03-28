export class Asset {
    public readonly symbol: string;
    public readonly name: string;

    constructor(item: any) {
        this.symbol = item.symbol;
        this.name = item.name;
    }
}