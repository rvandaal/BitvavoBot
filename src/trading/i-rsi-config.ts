import { Asset } from 'src/models/asset';

export interface IRsiConfig {
    asset: Asset;
    candleInterval: string;
    rsiPeriod: number;
    totalInvestmentInEuro: number; // you can never loose more than this
    startWithOverbought: boolean | undefined;
}
