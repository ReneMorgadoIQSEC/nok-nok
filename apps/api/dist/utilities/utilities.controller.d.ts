import { UtilitiesService } from './utilities.service';
export declare class UtilitiesController {
    private readonly utilitiesService;
    constructor(utilitiesService: UtilitiesService);
    sendCodeEmail(body: {
        email?: unknown;
    }): Promise<import("./utilities.types").UtilitiesResult>;
    verifyCodeEmail(body: {
        email?: unknown;
        code?: unknown;
    }): Promise<import("./utilities.types").UtilitiesResult>;
    private requireText;
}
