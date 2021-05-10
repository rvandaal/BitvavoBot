import { OpenOrder } from './open-order';

export class Market {
    public readonly currency: string;
    public readonly baseCurrency: string;
    public openOrders: OpenOrder[] = [];

    constructor(public marketName: string) {
        const index = marketName.indexOf('-');
        this.currency = marketName.substr(0, index);
        this.baseCurrency = marketName.substr(index + 1);
    }
}