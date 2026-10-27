"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacialController = void 0;
const common_1 = require("@nestjs/common");
const facial_service_1 = require("./facial.service");
const MAX_IMAGES = 10;
let FacialController = class FacialController {
    facialService;
    constructor(facialService) {
        this.facialService = facialService;
    }
    compare(body) {
        return this.facialService.compareImages(this.requireImages(body?.imgs_base64));
    }
    requireImages(value) {
        if (!Array.isArray(value) || value.length === 0 || value.length > MAX_IMAGES) {
            throw new common_1.BadRequestException('Se necesitan las imágenes de la prueba de vida');
        }
        return value.map((image) => {
            if (typeof image !== 'string' || !image.trim()) {
                throw new common_1.BadRequestException('Se necesitan las imágenes de la prueba de vida');
            }
            return image.trim();
        });
    }
};
exports.FacialController = FacialController;
__decorate([
    (0, common_1.Post)('compare'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FacialController.prototype, "compare", null);
exports.FacialController = FacialController = __decorate([
    (0, common_1.Controller)('facial'),
    __metadata("design:paramtypes", [facial_service_1.FacialService])
], FacialController);
//# sourceMappingURL=facial.controller.js.map