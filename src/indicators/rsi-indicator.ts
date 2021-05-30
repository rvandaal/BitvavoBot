import { CandleResponse } from 'src/response-models/candle-response';

export class RsiIndicator {
    public static getRsi(candleResponses: CandleResponse[], period: number, numberOfPoints: number = NaN): number[] {
        const rsi: number[] = [];
        // Order candles is from present to past
        const closeDeltaList = candleResponses.map((candleResponse, i) =>
            candleResponse.close - (i < candleResponses.length - 1 ? candleResponses[i + 1].close : candleResponse.open)
        );
        const firstPeriod = closeDeltaList.slice(0, period);
        let sumOfUpMoves = firstPeriod.map(v => this.getUpMove(v)).reduce((acc, cur) => acc + cur);
        let sumOfDownMoves = firstPeriod.map(v => this.getDownMove(v)).reduce((acc, cur) => acc + cur);

        rsi.push(this.getRsiFromSums(sumOfUpMoves, sumOfDownMoves));

        if (numberOfPoints > 1 || isNaN(numberOfPoints)) {
            const initialEndIndex = closeDeltaList.length - period;
            const endIndex = (isNaN(numberOfPoints) ? initialEndIndex : Math.min(initialEndIndex, numberOfPoints - 1));
            for (let i = 0; i < endIndex; i++) {
                const previousCloseDelta = closeDeltaList[i];
                const nextCloseDelta = closeDeltaList[period + i];
                sumOfUpMoves += this.getUpMove(nextCloseDelta) - this.getUpMove(previousCloseDelta);
                sumOfDownMoves += this.getDownMove(nextCloseDelta) - this.getDownMove(previousCloseDelta);
                rsi.push(this.getRsiFromSums(sumOfUpMoves, sumOfDownMoves));
            }
        }
        return rsi;
    }

    private static getUpMove(delta: number): number {
        return Math.max(0, delta);
    }

    private static getDownMove(delta: number): number {
        return Math.abs(Math.min(0, delta));
    }

    private static getRsiFromSums(sumUp: number, sumDown: number): number {
        return 100 - 100 / (1 + sumUp / sumDown);
    }
}
