import { FeeResponse } from "src/response-models/fee-reponse";

export class Fee {
    constructor(private feeResponse: FeeResponse) {
        
    }

    public get maker(): number {
        return this.feeResponse.maker;
    }

    public get taker(): number {
        return this.feeResponse.taker;
    }
}