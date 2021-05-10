import { Asset } from 'src/models/asset';

export interface IGridConfig {
    asset: Asset;
    maxBoundary?: number;
    minBoundary?: number;
    halfRange?: number; // if you fill this in, min and max will be ignored
    numberOfGridLines: number;
    totalInvestment?: number;
}