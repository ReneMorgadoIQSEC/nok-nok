import { UtilitiesResult } from './utilities.types';
export declare class UtilitiesService {
    sendCodeEmail(email: string): Promise<UtilitiesResult>;
    verifyCodeEmail(email: string, code: string): Promise<UtilitiesResult>;
    private post;
    private toResult;
    private isUtilitiesResult;
}
