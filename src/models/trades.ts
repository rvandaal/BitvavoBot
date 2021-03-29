import { GroupedTrade } from './grouped-trade';
import { Trade } from './trade';

export class Trades {
    public groupedList: GroupedTrade[];

    constructor(public readonly list: Trade[]){
        this.groupedList = [];
        this.updateGroupedList();
    }

    public updateGroupedList(): void {
        const groupedList: GroupedTrade[] = [];
        let currentDate: Date | undefined;
        let groupedTrade: GroupedTrade | undefined;

        for (let entry of this.list) {
            const date = entry.date;
            if (!currentDate || Math.abs(date.getTime() - currentDate?.getTime()) > 1000) {
                if (groupedTrade) {
                    groupedList.push(groupedTrade);
                }
                const euroAmount = entry.isBuy ?
                    (entry.amount * entry.price + entry.fee) :
                    ((entry.amount * entry.price - entry.fee));
                groupedTrade =
                    new GroupedTrade(entry.market, entry.amount, entry.price, entry.isBuy, date, entry.fee, euroAmount);
                currentDate = date;
            } else if (groupedTrade) {
                groupedTrade.amount += entry.amount;
                groupedTrade.euroAmount += entry.isBuy ?
                    (entry.amount * entry.price + entry.fee) :
                    (entry.amount * entry.price - entry.fee);
                groupedTrade.fee += entry.fee;
            }
        }
        if(groupedTrade) {
            groupedList.push(groupedTrade);
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