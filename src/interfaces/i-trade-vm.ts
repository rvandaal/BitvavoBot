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
    euroAmountAfterTrade: number;
    level: number;
}
