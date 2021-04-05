export class AssetResponse {
    public readonly symbol: string; // should be uppercase
    public readonly name: string;

    constructor(item: any) {
        this.symbol = item.symbol.toUpperCase();
        this.name = item.name;
    }
}
