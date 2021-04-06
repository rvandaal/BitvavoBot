import { Asset } from 'src/models/asset';
import { Trade } from 'src/models/trade';

export class AssetVm {
    public areRowDetailsOpen: boolean;

    constructor(public asset: Asset) {
        this.areRowDetailsOpen = false;
    }

    public get symbol(): string {
        return this.asset.symbol;
    }

    public get name(): string {
        return this.asset.name;
    }

    public get available(): number {
        return this.asset.available;
    }

    public get inOrder(): number {
        return this.asset.inOrder;
    }

    public get currentPrice(): number {
        return this.asset.currentPrice;
    }

    public get investment(): number {
        return this.asset.investment;
    }

    public get euroTradingPair(): string {
        return this.asset.euroTradingPair;
    }

    public get totalAmount(): number {
        return this.asset.totalAmount;
    }

    public get currentValue(): number {
        return this.asset.currentValue;
    }

    public get change24h(): number {
        return this.asset.change24h;
    }

    public get change1m(): number | undefined {
        return this.asset.change1m;
    }

    public get relativeChange(): number | undefined {
        return this.asset.relativeChange;
    }

    public get numberOfSubsequentIncreasements(): number {
        return this.asset.numberOfSubsequentIncreasements;
    }

    public get trades(): Trade[] | undefined {
        return this.asset.trades;
    }
}