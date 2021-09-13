export interface ITradeVm {
    id: string;
    name: string;
    date: Date | undefined;
    children: ITradeVm[];
    hasChildren: boolean;
    areRowDetailsOpen: boolean;
    amount: number;
    price: number;
    fee: number;
    altAmountAfterTrade: number;
    cashAfterTrade: number;
    grandTotalInEuroWhenThisWasLastTrade: number;
    profit: number;
    goodCall: boolean;
    priceAtWhichTargetIsReachedAfterSellingAll: number;
    priceAtWhichTargetIsReachedWithCurrentCash: number;
    level: number;
}
