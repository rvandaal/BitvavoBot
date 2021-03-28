import { GroupedTradeHistoryItem } from './grouped-trade-history-item';
import { TradeHistoryItem } from './trade-history-item';

export class TradeHistory {
    public groupedList: GroupedTradeHistoryItem[];

    constructor(public readonly list: TradeHistoryItem[]){
        this.groupedList = [];
        this.updateGroupedList();
    }

    public updateGroupedList(): void {
        const groupedList: GroupedTradeHistoryItem[] = [];
        let currentDate: Date | undefined;
        let groupedItem: GroupedTradeHistoryItem | undefined;

        for (let entry of this.list) {
            const date = entry.date;
            if (!currentDate || Math.abs(date.getTime() - currentDate?.getTime()) > 1000) {
                if (groupedItem) {
                    groupedList.push(groupedItem);
                }
                const euroAmount = entry.isBuy ?
                    (entry.amount * entry.price + entry.fee) :
                    ((entry.amount * entry.price - entry.fee));
                groupedItem =
                    new GroupedTradeHistoryItem(entry.market, entry.amount, entry.price, entry.isBuy, date, entry.fee, euroAmount);
                currentDate = date;
            } else if (groupedItem) {
                groupedItem.amount += entry.amount;
                groupedItem.euroAmount += entry.isBuy ?
                    (entry.amount * entry.price + entry.fee) :
                    (entry.amount * entry.price - entry.fee);
                groupedItem.fee += entry.fee;
            }
        }
        if(groupedItem) {
            groupedList.push(groupedItem);
        }
        // Compute totals
        for (let i = groupedList.length - 1; i >= 0; i--) {
            const item = groupedList[i];
            let previousTotal = 0;
            let previousTotalEuro = 0;
            if (i < groupedList.length - 1) {
                previousTotal = groupedList[i + 1].totalAmount;
                previousTotalEuro = groupedList[i + 1].totalEuroAmount;
            }
            item.totalAmount = previousTotal + (item.isBuy ? item.amount : -item.amount);
            item.totalEuroAmount = previousTotalEuro + (item.isBuy ? item.euroAmount : -item.euroAmount);
        }
        
        this.groupedList = groupedList;
    }
}