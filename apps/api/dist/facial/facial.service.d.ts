import { FacialCompareResult } from './facial.types';
export declare class FacialService {
    compareImages(images: string[]): Promise<FacialCompareResult>;
    private toResult;
    private isCompareResult;
}
