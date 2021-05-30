export class CandleResponse {
    public readonly date: Date;
    public readonly open: number;
    public readonly high: number;
    public readonly low: number;
    public readonly close: number;
    public readonly volume: number;

    constructor(item: any) {
        this.date = new Date(item[0]);
        this.open = +item[1];
        this.high = +item[2];
        this.low = +item[3];
        this.close = +item[4];
        this.volume = +item[5];
    }

    public toString(): string {
        return 'Low - high: ' + this.low + ', ' + this.high;
    }
}
