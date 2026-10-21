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
exports.UtilitiesController = void 0;
const common_1 = require("@nestjs/common");
const utilities_service_1 = require("./utilities.service");
let UtilitiesController = class UtilitiesController {
    utilitiesService;
    constructor(utilitiesService) {
        this.utilitiesService = utilitiesService;
    }
    sendCodeEmail(body) {
        return this.utilitiesService.sendCodeEmail(this.requireText(body?.email, 'El correo es obligatorio'));
    }
    verifyCodeEmail(body) {
        return this.utilitiesService.verifyCodeEmail(this.requireText(body?.email, 'El correo es obligatorio'), this.requireText(body?.code, 'El código es obligatorio'));
    }
    requireText(value, message) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new common_1.BadRequestException(message);
        }
        return value.trim();
    }
};
exports.UtilitiesController = UtilitiesController;
__decorate([
    (0, common_1.Post)('send-code-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UtilitiesController.prototype, "sendCodeEmail", null);
__decorate([
    (0, common_1.Post)('verify-code-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UtilitiesController.prototype, "verifyCodeEmail", null);
exports.UtilitiesController = UtilitiesController = __decorate([
    (0, common_1.Controller)('utilities'),
    __metadata("design:paramtypes", [utilities_service_1.UtilitiesService])
], UtilitiesController);
//# sourceMappingURL=utilities.controller.js.map