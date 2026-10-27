import { FacialService } from './facial.service';
export declare class FacialController {
    private readonly facialService;
    constructor(facialService: FacialService);
    compare(body: {
        imgs_base64?: unknown;
    }): Promise<import("./facial.types").FacialCompareResult>;
    private requireImages;
}
