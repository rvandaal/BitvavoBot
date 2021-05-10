import { Market } from 'src/models/market';
import { OpenOrderVm } from './open-order-vm';

export class MarketVm {

    public areRowDetailsOpen = true;
    public openOrders: OpenOrderVm[] = [];
    private marketInternal: Market;

    constructor(market: Market) {
        this.marketInternal = market;
        this.updateMarket();
    }

    public get market(): Market {
        return this.marketInternal;
    }

    public set market(value: Market) {
        this.marketInternal = value;
        this.updateMarket();
    }

    public get marketName(): string {
        return this.market.marketName;
    }

    public get currency(): string {
        return this.market.currency;
    }

    public get baseCurrency(): string {
        return this.market.baseCurrency;
    }

    private updateMarket(): void {
        const openOrdersModel = this.marketInternal.openOrders;
        const openOrdersViewModel = this.openOrders;
        // tslint:disable-next-line: prefer-const
        for (let openOrderModel of openOrdersModel) {
            const existingOpenOrderViewModel = openOrdersViewModel.find(o => o.orderId === openOrderModel.orderId);
            if (existingOpenOrderViewModel) {
                existingOpenOrderViewModel.openOrder = openOrderModel;
            } else {
                const newOpenOrderViewModel = new OpenOrderVm(openOrderModel);
                this.openOrders.push(newOpenOrderViewModel);
            }
        }
        const listToDelete: number[] = [];
        openOrdersViewModel.forEach((openOrderViewModel, index) => {
            const existingOpenOrder = openOrdersModel.find(o => o.orderId === openOrderViewModel.orderId);
            if (!existingOpenOrder) {
                listToDelete.push(index);
            }
        });
        for (let i = listToDelete.length - 1; i >= 0; i--) {
            // note: splice changes original array
            this.openOrders.splice(listToDelete[i], 1);
        }
    }

    // public createOrUpdate(openOrder: OpenOrder): void {
    //     if (this.marketName !== openOrder.market) {
    //         return;
    //     }
    //     let openOrderVm = this.openOrders.find(o => o.orderId === openOrder.orderId);
    //     if (openOrderVm) {
    //         openOrderVm.openOrder = openOrder;
    //     } else {
    //         openOrderVm = new OpenOrderVm(openOrder);
    //         this.openOrders.push(openOrderVm);
    //     }
    // }
}